# Publicar Livescape en Render

La configuración `render.yaml` deja preparado un servicio Node y una base PostgreSQL.

## Pasos

1. Crear una cuenta en Render.
2. Crear un repositorio Git con el contenido de esta carpeta.
3. En Render, conectar el repositorio.
4. Crear el servicio usando el Blueprint `render.yaml`.
5. Confirmar las variables generadas.
6. Esperar el primer deploy.
7. Probar `https://TU-SERVICIO.onrender.com/health`.
8. Probar registro y login.

Render permite conectar un repositorio Git y desplegar un Web Service para Express, además de crear una base PostgreSQL administrada. Los servicios web tienen un subdominio `onrender.com` y admiten dominios personalizados. 

## Base de datos

Para pruebas, Render ofrece una instancia gratuita, pero actualmente la documentación indica que el Postgres gratuito expira después de 30 días. Para una plataforma que vaya a conservar usuarios y contenido, usa un plan de base de datos que no tenga esa limitación.

## Antes de producción

- Añadir almacenamiento externo para imágenes.
- Configurar dominio propio.
- Verificar correo electrónico.
- Implementar recuperación de contraseña.
- Añadir moderación administrativa.
- Añadir backups y restauración probada.
- Revisar límites de uso y logs.
