# Taller Web II

Aplicación web preparada con Angular para el frontend y Node.js con Express para la API.

## Requisitos

- Node.js 24 o compatible con Angular CLI 22.
- npm.
- PostgreSQL para guardar usuarios.

## Estructura

- front/: aplicación Angular.
  - src/app/features/users/: formulario de registro y cliente de la API.
  - src/app/features/products/: página de productos preparada.
  - src/app/features/cart/: página del carrito preparada.
- back/: API de Node.js y Express.
  - src/features/users/: rutas y controlador de usuarios.
  - src/features/products/: punto de entrada de productos.
  - src/features/cart/: punto de entrada del carrito.
  - src/routes/index.ts: montaje de módulos de API.
- scripts/dev.mjs: inicia frontend y backend juntos.

## Preparar el entorno

Instalá las dependencias desde la raíz del proyecto:

    npm ci --prefix front
    npm ci --prefix back

Configurá PostgreSQL. Copiá el archivo de ejemplo y editá la cadena de conexión:

    Copy-Item back/.env.example back/.env

En `back/.env`, configurá `PORT=5555` y `DATABASE_URL` con el usuario, contraseña y nombre de tu base de datos. El proyecto usa la tabla `users` definida en `back/prisma/schema.prisma`; no hace falta ejecutar `db pull`. Para crear la tabla y generar el cliente, desde `back` ejecutá:

    npm run db:migrate -- --name crear_usuarios

## Ejecutar durante la presentación

Desde la raíz del repo, ejecutá un solo comando:

    npm run dev

La terminal muestra las salidas con las etiquetas API y WEB. Abrí http://localhost:4200. La API queda disponible en http://localhost:5555. Para detener ambos procesos, presioná Ctrl+C.

También podés iniciar cada parte por separado:

    npm run dev:front
    npm run dev:back

## Registro de usuario

El formulario solicita email, contraseña, nombre, apellido y dirección. Valida campos obligatorios y formato del email. La contraseña requiere al menos 8 caracteres, con mayúscula, minúscula, número y símbolo. El backend normaliza el email, aplica la restricción única en PostgreSQL y guarda la contraseña con scrypt.

El endpoint de registro es POST /api/usuario/registro. Productos y carrito tienen rutas de módulo preparadas, pero todavía no implementan operaciones de negocio.

## Inicio de sesion

La ruta `/login` permite ingresar con el email y la contrasena registrados. Si coinciden, la aplicacion continua a `/productos`; si no, muestra un mensaje claro. El endpoint es `POST /api/usuario/login`. Registro e inicio de sesion requieren que PostgreSQL este configurado y disponible.
