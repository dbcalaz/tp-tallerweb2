# Backend

API REST de Taller Web II, construida con Node.js, Express y TypeScript.

## Módulos

- src/features/users/: registro de usuarios y rutas relacionadas.
- src/features/products/: punto de entrada reservado para productos.
- src/features/cart/: punto de entrada reservado para carrito.
- src/routes/index.ts: montaje central de las rutas de cada módulo.
- src/app.ts: configuración de Express.
- src/index.ts: inicio del servidor.

## Ejecutar

Configurá DATABASE_URL en el archivo .env y prepará la base como indica el README principal. Después:

    npm install
    npm run dev