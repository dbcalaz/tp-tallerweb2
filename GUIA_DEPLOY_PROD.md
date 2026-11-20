# Guía de Deploy en Producción (Todo en Render + Neon)

## Opción 1 (Recomendada): Todo en un solo servicio de Render

Con esta configuración, **un único Web Service de Render** compila y sirve tanto el **Frontend (Angular)** como el **Backend (Express + Prisma)** bajo el mismo dominio, conectado a la base de datos en **Neon**.

### Ventajas frente a separarlo en GitHub Pages:
- **Un solo dominio y cero problemas de CORS:** el frontend y `/api` corren en el mismo origen, por lo que `API_URL: '/api'` funciona sin tocar nada.
- **Rutas SPA limpias:** Express sirve `index.html` automáticamente para cualquier ruta de Angular (`/catalogo`, `/perfil`, `/productos/1`, etc.).
- **Un único deploy:** cada push a `main` actualiza frontend, backend y migraciones juntas.

### Pasos para deployar en Render:
1. Subí los cambios a `main` (`git push origin main`).
2. Ingresá a [https://dashboard.render.com](https://dashboard.render.com) con tu cuenta de GitHub.
3. Hacé clic en **New +** -> **Blueprint** y seleccioná el repositorio `dbcalaz/tp-tallerweb2`.
   *(Render leerá automáticamente el archivo `render.yaml` de la raíz).*
   > Si preferís crear el **Web Service** manualmente sin Blueprint:
   > - **Root Directory:** *(dejar vacío)*
   > - **Build Command:** `npm run build`
   > - **Start Command:** `npm start`
   > - **Health Check Path:** `/api/health`
4. Cargá las variables de entorno en Render:
   - `DATABASE_URL`: URL del pooler de Neon (la de `back/.env`).
   - `DIRECT_URL`: URL directa de Neon (sin `-pooler`, para `prisma migrate deploy`).
   - `JWT_SECRET`: se autogenera con el Blueprint (o poné una clave segura).
   - `NODE_ENV`: `production`
   - *(Opcional, solo para emails de recuperación)*: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
   *(No hace falta configurar `FRONTEND_URL` ni `API_URL`: Express usa `RENDER_EXTERNAL_URL` automáticamente y Angular usa `/api`).*
5. Al finalizar el deploy, tu aplicación completa estará online en `https://<tu-servicio>.onrender.com`.

> **Nota sobre el plan gratuito de Render:** si la app no recibe tráfico durante 15 minutos, Render la suspende y el primer request tarda ~30–50 segundos en despertar.

---

## Opción 2 (Alternativa): Frontend en GitHub Pages + Backend en Render

El workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) también queda disponible si preferís publicar solo el frontend en GitHub Pages:
1. En Render deployás solo la carpeta `back` (y configurás `CORS_ORIGIN=https://dbcalaz.github.io` y `FRONTEND_URL=https://dbcalaz.github.io/tp-tallerweb2`).
2. En GitHub: **Settings** -> **Secrets and variables** -> **Actions** -> **Variables**, creás `API_URL` con la URL del backend (`https://<tu-backend>.onrender.com/api`).
3. En GitHub: **Settings** -> **Pages** -> **Source** -> **GitHub Actions**.
