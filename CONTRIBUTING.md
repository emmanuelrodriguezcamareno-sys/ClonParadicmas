# Cómo trabajar en equipo

1. `main` siempre debe funcionar. Nadie hace push directo a `main`.
2. Antes de empezar: `git checkout main` y `git pull`.
3. Crea una rama por tarea: `git checkout -b feature/nombre-corto` (o `fix/...`, `docs/...`).
4. Haz commits pequeños con mensajes claros: `feat: agrega historial de temperatura`.
5. Sube tu rama: `git push -u origin feature/nombre-corto`.
6. Abre un Pull Request en GitHub y pide revisión a un compañero.
7. Cuando lo aprueben, haz merge y borra la rama.

Nunca subas `.env` ni `secrets.h` (ya están en `.gitignore`). Si cambias una variable, actualiza
también `backend/.env.example` o `secrets.example.h`.
