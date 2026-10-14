/*
  Incubadora fisica: ESP32 + DHT11 + LCD I2C + LED + buzzer pasivo
  Lee la temperatura, la muestra en el LCD, activa la alarma local
  y envia las mediciones al backend por HTTP(S).

  Pines: DHT11 DATA=GPIO4, LED=GPIO26, Buzzer=GPIO27, SDA=GPIO21, SCL=GPIO22
  Librerias: DHT sensor library (Adafruit), LiquidCrystal I2C (Frank de Brabander)
*/
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include "secrets.h"

#define PIN_DHT     4
#define PIN_LED     26
#define PIN_BUZZER  27
#define TEMP_ALARMA 40.0
#define TEMP_BAJA   25.0

#define READ_EVERY_MS 2000
#define SEND_EVERY_MS 5000
#define WIFI_RETRY_MS 10000

DHT dht(PIN_DHT, DHT11);
LiquidCrystal_I2C *lcd;
WiFiClientSecure secureClient;

unsigned long lastRead = 0, lastSend = 0, lastWifiTry = 0;

void conectarWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) delay(250);
  Serial.println(WiFi.status() == WL_CONNECTED ? "WiFi conectado: " + WiFi.localIP().toString()
                                               : "WiFi no disponible (se reintentara)");
}

void enviarTelemetria(float t, float h) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  if (String(API_URL).startsWith("https")) {
    secureClient.setInsecure();  // SOLO para pruebas. En produccion cargar el certificado raiz.
    http.begin(secureClient, API_URL);
  } else {
    http.begin(API_URL);
  }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);
  char body[128];
  snprintf(body, sizeof(body), "{\"incubatorId\":\"%s\",\"temperature\":%.1f,\"humidity\":%.1f}",
           INCUBATOR_ID, t, h);
  int code = http.POST(body);
  Serial.printf("POST -> %d\n", code);
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_LED, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  Wire.begin(21, 22);
  uint8_t dir = 0x27;
  Wire.beginTransmission(0x3F);
  if (Wire.endTransmission() == 0) dir = 0x3F;
  lcd = new LiquidCrystal_I2C(dir, 16, 2);
  lcd->init();
  lcd->backlight();
  lcd->print("Conectando WiFi");

  dht.begin();
  conectarWifi();
  lcd->clear();
}

void loop() {
  unsigned long now = millis();

  if (WiFi.status() != WL_CONNECTED && now - lastWifiTry > WIFI_RETRY_MS) {
    lastWifiTry = now;
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }

  if (now - lastRead < READ_EVERY_MS) return;
  lastRead = now;

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("Error leyendo el DHT11");
    lcd->setCursor(0, 0);
    lcd->print("Error sensor    ");
    lcd->setCursor(0, 1);
    lcd->print("                ");
    digitalWrite(PIN_LED, LOW);
    noTone(PIN_BUZZER);
    return;
  }

  bool alarma = (t > TEMP_ALARMA || t < TEMP_BAJA);
  digitalWrite(PIN_LED, alarma);
  if (alarma) tone(PIN_BUZZER, 2000);
  else noTone(PIN_BUZZER);

  lcd->setCursor(0, 0);
  lcd->printf("Temp: %4.1f %cC  ", t, (char)223);
  lcd->setCursor(0, 1);
  if (alarma) lcd->print("ALARMA!         ");
  else lcd->printf("Hum:%3.0f%% %s ", h, WiFi.status() == WL_CONNECTED ? "WiFi" : "----");

  Serial.printf("Temp: %.1f  Hum: %.0f  Alarma: %s\n", t, h, alarma ? "SI" : "NO");

  if (now - lastSend >= SEND_EVERY_MS) {
    lastSend = now;
    enviarTelemetria(t, h);
  }
}
