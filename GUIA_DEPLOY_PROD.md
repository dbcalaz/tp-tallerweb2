# Guía de Deploy en Producción (Render + Neon)

Un único **Web Service en Render** compila y sirve tanto el **Frontend (Angular)** como el **Backend (Express + Prisma)** bajo el mismo dominio, conectado a la base de datos PostgreSQL en **Neon**.

## Ventajas de esta arquitectura
- **Un solo dominio y cero problemas de CORS:** el frontend y `/api` corren en el mismo origen (`API_URL: '/api'`).
- **Rutas SPA limpias:** Express sirve `index.html` automáticamente para cualquier ruta de Angular (`/catalogo`, `/perfil`, `/productos/1`, etc.).
- **Un único deploy:** cada push a `main` actualiza frontend, backend y migraciones juntas.

## Pasos para deployar en Render
1. Subí los cambios a `main` (`git push origin main`).
2. Ingresá a [https://dashboard.render.com](https://dashboard.render.com) con tu cuenta de GitHub.
3. Hacé clic en **New +** -> **Blueprint** y seleccioná el repositorio `dbcalaz/tp-tallerweb2` *(toma la configuración de `render.yaml`)*.
   > Si creás el **Web Service** manualmente sin Blueprint:
   > - **Root Directory:** *(dejar vacío)*
   > - **Build Command:** `npm run build`
   > - **Start Command:** `npm start`
   > - **Health Check Path:** `/api/health`
4. Cargá las variables de entorno en Render:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: URL del pooler de Neon (la de `back/.env`, sin comillas).
   - `DIRECT_URL`: URL directa de Neon (sin `-pooler`, opcional para `prisma migrate deploy`).
   - `JWT_SECRET`: clave secreta aleatoria larga (se autogenera con Blueprint).
   - `MP_ACCESS_TOKEN`: Access Token de Mercado Pago (del mismo par que `mpPublicKey` del front).
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: credenciales SMTP (para comprobantes de compra y recuperación de contraseña).
   *(No hace falta configurar `FRONTEND_URL` ni `API_URL`: Express usa `RENDER_EXTERNAL_URL` automáticamente y Angular usa `/api`).*
5. Al finalizar el deploy, tu aplicación completa estará online en `https://<tu-servicio>.onrender.com`.

> **Nota sobre el plan gratuito de Render:** si la app no recibe tráfico durante 15 minutos, Render la suspende y el primer request tarda ~30–50 segundos en despertar.
