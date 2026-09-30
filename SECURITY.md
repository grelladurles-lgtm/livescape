# Seguridad antes de producción

La base incluida es un punto de partida, no una auditoría de seguridad.

Pendientes recomendados:
- rate limiting
- CSRF cuando corresponda
- validación de payloads con esquema
- protección XSS al renderizar contenido
- recuperación segura de contraseña
- verificación de correo
- rotación de secretos
- cookies HttpOnly/SameSite si se cambia de JWT en localStorage
- límites y escaneo de archivos
- moderación de contenido
- backups y restauración probada
- logs sin contraseñas, tokens ni datos sensibles
- controles de acceso para administración
