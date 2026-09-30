# Puesta en marcha de Livescape

## Requisitos
- Node.js 18+
- PostgreSQL 14+

## 1. Instalar
```bash
npm install
```

## 2. Configurar
Copia `.env.example` como `.env` y completa:
- DATABASE_URL
- JWT_SECRET
- PORT

## 3. Crear la base de datos
Crea una base PostgreSQL llamada `livescape` y ejecuta:
```bash
psql "$DATABASE_URL" -f database/schema.sql
```

## 4. Ejecutar
```bash
npm start
```

Abre:
http://localhost:3000

## 5. Producción
Antes de publicar:
- utilizar HTTPS
- guardar secretos únicamente en variables de entorno
- configurar backups
- configurar almacenamiento de imágenes
- añadir rate limiting
- añadir verificación de correo
- configurar moderación
- configurar logs y alertas
- añadir pruebas automatizadas
