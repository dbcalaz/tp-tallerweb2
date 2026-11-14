# Guía de Ejecución - Taller Web II

Esta guía explica los pasos para configurar, ejecutar y probar la aplicación con su flujo original.

---

## 1. Requisitos Previos

- **Node.js:** Versión 24 o compatible (Node 22+).
- **npm**
- **PostgreSQL:** Servidor local o remoto activo para persistir usuarios.

---

## 2. Configuración de la Base de Datos (Cloud - Neon)

El proyecto utiliza una base de datos PostgreSQL alojada en **Neon Cloud**, lo que permite que todos los integrantes del equipo compartan la misma información sin necesidad de configurar una base local.

1. **Variables de entorno (`back/.env`):**
   Copiá el archivo de ejemplo y configurá la cadena de conexión de Neon que te comparta el equipo por privado:
   ```env
   PORT=5555
   DATABASE_URL="postgresql://<USUARIO>:<PASSWORD>@<HOST>/<DATABASE>?sslmode=require"
   ```

2. **Generar el cliente de Prisma (si es la primera vez que clonás):**
   ```powershell
   npm.cmd --prefix back run db:generate
   ```
   *(Las tablas y migraciones ya se encuentran aplicadas en la base de datos cloud).*

---

## 3. Cómo Ejecutar el Proyecto

Desde la raíz del repositorio:

```powershell
npm run dev
```

Esto inicia simultáneamente:
- **API (Node.js + Express):** `http://localhost:5555`
- **Frontend (Angular):** `http://localhost:4200`

Para detener ambos procesos, presioná `Ctrl + C` en la terminal.

*(También podés iniciarlos en terminales separadas con `npm run dev:back` y `npm run dev:front`).*

---

## 4. Crear Usuario e Iniciar Sesión

Dado que el proyecto utiliza PostgreSQL real sin usuarios hardcodeados:

1. Abrí [http://localhost:4200](http://localhost:4200).
2. Entrá a la pantalla de **Registro** ([http://localhost:4200/usuarios/registro](http://localhost:4200/usuarios/registro)) o hacé clic en *"Registrate"*.
3. Completá los campos:
   - **Email:** Un correo válido (ej: `admin@taller.com`).
   - **Contraseña:** Requiere al menos 8 caracteres, con mayúscula, minúscula, número y símbolo (ej: `Admin123!`).
   - **Nombre, Apellido y Dirección.**
4. Una vez creada la cuenta en PostgreSQL, ingresá desde [http://localhost:4200/login](http://localhost:4200/login) con ese email y contraseña.
