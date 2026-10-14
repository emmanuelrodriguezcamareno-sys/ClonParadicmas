import { Body, Controller, Get, Headers, Param, Post, Query, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IncubatorsService } from './incubators.service';
import { TelemetryBatchDto, TelemetryDto } from './telemetry.dto';

@Controller('api')
export class IncubatorsController {
  constructor(
    private readonly service: IncubatorsService,
    private readonly config: ConfigService,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  // El ESP32 envia aqui sus mediciones.
  @Post('telemetry')
  ingest(@Headers('x-api-key') key: string, @Body() dto: TelemetryDto) {
    this.assertKey(key);
    return this.service.ingest(dto, 'esp32');
  }

  @Post('telemetry/batch')
  ingestBatch(@Headers('x-api-key') key: string, @Body() body: TelemetryBatchDto) {
    this.assertKey(key);
    return this.service.ingestMany(body.items, 'esp32');
  }

  @Get('incubators')
  list() {
    return this.service.list();
  }

  @Get('incubators/:id/history')
  history(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.service.history(id, limit ? Number(limit) : 100);
  }

  private assertKey(key?: string) {
    const expected = this.config.get<string>('DEVICE_API_KEY');
    if (!expected || key !== expected) throw new UnauthorizedException('API key inválida');
  }
}
