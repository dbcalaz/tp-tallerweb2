# Taller Web II

Aplicación de comercio electrónico con frontend Angular y API Node.js/Express. El backend usa Prisma y PostgreSQL.

## Requisitos

- Node.js 24 o compatible con Angular CLI 22.
- npm.
- Una base PostgreSQL local o la base compartida del equipo en Neon.

## Instalar dependencias

Desde la raíz del repositorio:

```powershell
npm ci --prefix front
npm ci --prefix back
```

## Configurar base de datos

Creá `back/.env` a partir de `back/.env.example` y configurá `DATABASE_URL`. No subas `back/.env` a Git.

Para aplicar las migraciones pendientes de la base compartida (por ejemplo, una migración nueva de recuperación de contraseña) y generar el cliente Prisma:

```powershell
npm run db:deploy
npm run db:generate
```

En una base local descartable, las migraciones nuevas se pueden crear con `npm --prefix back run db:migrate -- --name nombre_migracion`.

## Correr frontend y backend

Desde la raíz:

```powershell
npm run dev
```

- Frontend Angular: <http://localhost:4200>
- API Express: <http://localhost:5555>

`Ctrl+C` detiene ambos procesos. También se pueden ejecutar por separado con `npm run dev:front` y `npm run dev:back`.

## Funciones

- Registro e inicio de sesión con validaciones, email único y contraseñas con hash scrypt.
- Catálogo con filtros, orden y paginación en páginas de 12 productos.
- Detalle de producto, carrito y compras.
- Recuperación de contraseña con enlace de un solo uso que vence a los 30 minutos.

## Correo para recuperar contraseña

Configurá `FRONTEND_URL` y las variables `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM` en `back/.env` para enviar el enlace al correo. En desarrollo, si SMTP no está configurado, el backend escribe el enlace en la terminal de la API para poder probar el flujo localmente. En producción, SMTP es obligatorio.

La recuperación usa la tabla `password_reset_tokens`; aplicá la migración de Prisma antes de usarla en una base compartida.
