# Guía de Acceso y Consultas SQL a la Base de Datos (Neon Cloud)

Esta guía explica cómo acceder a la base de datos PostgreSQL compartida del proyecto, consultar las tablas y ejecutar sentencias SQL tanto desde el navegador como desde clientes externos.

---

## 1. Datos de Conexión

> [!NOTE]
> Las credenciales reales se gestionan por privado a través del archivo `back/.env` y nunca deben subirse al repositorio.

| Parámetro | Valor |
| :--- | :--- |
| **Motor** | PostgreSQL 16+ |
| **Host** | `<HOST_NEON>`  |
| **Puerto** | `5432` |
| **Base de Datos** | `neondb` |
| **Usuario** | `<USUARIO>`  |
| **Contraseña** | `<PASSWORD>`  |
| **SSL Mode** | `require` *(Obligatorio)* |

### Cadena de Conexión Completa (URI):
```text
postgresql://<USUARIO>:<PASSWORD>@<HOST>/neondb?sslmode=require
```

---

## 2. Métodos de Acceso

### Opción A: Consola Web de Neon (Recomendado para el navegador)
No requiere instalar ningún programa en tu computadora:

1. **Invitar a un compañero:**
   - Entrá a **[https://console.neon.tech](https://console.neon.tech)** con tu cuenta.
   - En el menú lateral o superior, andá a **Settings** (o **Organization Settings**) -> **Members**.
   - Hacé clic en **"Invite Member"** (o *"Add Member"*).
   - Ingresá el correo electrónico de tu compañero con rol **Member** o **Developer**.
2. **Acceder al editor SQL:**
   - Una vez aceptada la invitación, ingresá al proyecto y seleccioná en la barra lateral izquierda la opción **SQL Editor**.
   - Podés escribir consultas directamente y presionar **Run** (o `Ctrl + Enter`):
     ```sql
     -- Ver todos los usuarios registrados
     SELECT id, email, nombre, apellido, "createdAt" FROM users;

     -- Ver productos en el catálogo
     SELECT id, nombre, precio, stock, activo FROM productos;
     ```
3. **Explorador Visual (Tables):**
   - En la sección **Tables** del menú podés ver las tablas existentes (`users`, `productos`, `categorias`, `marcas`, `carritos`, `compras`) y sus columnas sin escribir código.

---

### Opción B: Clientes SQL de Escritorio (DBeaver, pgAdmin, TablePlus, DataGrip)
Si preferís usar una herramienta instalada en tu sistema:

1. Abrí tu cliente (ej. **DBeaver** o **pgAdmin**) y creá una **Nueva Conexión PostgreSQL**.
2. Completá los campos con los datos de tu `back/.env`:
   - **Host:** `<HOST_NEON>`
   - **Database:** `neondb`
   - **Username:** `<USUARIO>`
   - **Password:** `<PASSWORD>`
   - **Port:** `5432`
3. **Pestaña SSL:** Asegurate de marcar **SSL = Require** (o habilitar SSL), ya que Neon rechaza conexiones no cifradas por seguridad.
4. Hacé clic en **Test Connection** y luego en **Finalizar**.

---

### Opción C: Prisma Studio (Interfaz Visual Local tipo Excel)
Si tenés el repositorio clonado en tu máquina, podés abrir un panel visual administrable:

1. En la raíz del proyecto, ejecutá:
   ```powershell
   npm.cmd --prefix back exec prisma studio
   ```
2. Se abrirá automáticamente en tu navegador un dashboard (habitualmente en `http://localhost:5555`).
3. Desde allí podés:
   - Ver todas las tablas y sus relaciones.
   - Filtrar y ordenar registros.
   - Crear, editar o borrar filas directamente con un clic.

---

## 3. Tablas Disponibles en la Base de Datos

- **`users`:** Cuentas de usuarios registrados (`email`, `passwordHash`, `nombre`, `apellido`, `direccion`).
- **`categorias`:** Categorías principales de productos.
- **`tipos_productos`:** Subcategorías asociadas a una categoría.
- **`marcas`:** Fabricantes de hardware/periféricos.
- **`productos`:** Catálogo de productos (`precio`, `stock`, `activo`, `imagenUrl`).
- **`carritos`:** Carrito de compras asociado a cada usuario (1 a 1).
- **`carrito_productos`:** Ítems temporales y cantidades dentro del carrito de un usuario.
- **`compras`:** Registro de órdenes finalizadas (`total`, `estado`, `direccionEnvio`).
- **`detalles_compras`:** Renglones históricos de cada compra (`precioUnitario`, `cantidad`).

