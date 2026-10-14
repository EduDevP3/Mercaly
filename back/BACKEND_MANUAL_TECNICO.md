# 📘 LBM (La Barata Mayoreos) - Manual Técnico del Backend & Referencia de API

> **Versión:** 1.1.0  
> **Entorno:** Node.js + Express (ES6 Babel) + MongoDB (Mongoose)  
> **Base de Datos:** MongoDB Atlas (`LBM`)  
> **Servidor en Producción:** `https://tribuna-back-nfl9.onrender.com/api/v1`  
> **Almacenamiento de Multimedia:** Cloudinary  

---

## 📑 Tabla de Contenidos
1. [Arquitectura General & Flujo de Datos](#1-arquitectura-general--flujo-de-datos)
2. [Variables de Entorno & Configuración](#2-variables-de-entorno--configuración)
3. [Modelos de Base de Datos (Mongoose Schemas)](#3-modelos-de-base-de-datos-mongoose-schemas)
   - [User (Administradores)](#modelo-user)
   - [Client (Clientes E-commerce)](#modelo-client)
   - [Product (Catálogo de Ropa)](#modelo-product)
   - [Category (Categorías de Productos)](#modelo-category)
   - [Order (Pedidos y Promociones)](#modelo-order)
   - [Alert (Notificaciones del Sistema)](#modelo-alert)
4. [Autenticación & Seguridad de Sesión](#4-autenticación--seguridad-de-sesión)
5. [Catálogo Completo de Endpoints](#5-catálogo-completo-de-endpoints)
   - [Rutas de Salud & Ping](#endpoints-de-salud-y-ping)
   - [Rutas de Auth Admin (`/auth`)](#endpoints-de-autenticación-admin)
   - [Rutas de Auth Clientes (`/client/auth`)](#endpoints-de-autenticación-clientes)
   - [Rutas de Clientes CRUD (`/clients`)](#endpoints-de-clientes-crud-admin)
   - [Rutas de Productos (`/products`)](#endpoints-de-productos)
   - [Rutas de Categorías (`/categories`)](#endpoints-de-categorías)
   - [Rutas de Pedidos (`/orders`)](#endpoints-de-pedidos-orders)
6. [Flujo de Subida de Imágenes (Multer + Cloudinary)](#6-flujo-de-subida-de-imágenes-multer--cloudinary)
7. [Reglas de Negocio Clave](#7-reglas-de-negocio-clave)
8. [Buenas Prácticas para el Front (Admin & Store)](#8-buenas-prácticas-para-el-front-admin--store)

---

## 1. Arquitectura General & Flujo de Datos

El backend está estructurado con el patrón en capas: **Ruta -> Controlador -> Servicio -> Modelo (Mongoose)**.

```
       [ Frontend Admin (Netlify) ]        [ Frontend Store (Vercel) ]
                    │                                   │
                    ▼                                   ▼
          ┌──────────────────────────────────────────────────┐
          │               Express 4 Application              │
          │  Middlewares: Helmet, CORS, Cookie-Parser, Rate  │
          └─────────────────────────┬────────────────────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               ▼                    ▼                    ▼
       [/auth & /products]     [/client/auth]       [/orders]
               │                    │                    │
               ▼                    ▼                    ▼
          Controllers          Controllers          Controllers
               │                    │                    │
               ▼                    ▼                    ▼
            Services             Services             Services
               │                    │                    │
               ├────────────────────┼────────────────────┤
               ▼                                         ▼
      MongoDB Atlas (Mongoose)                 Cloudinary Media Storage
```

### Directorios:
- `src/config/`: Conexión a MongoDB, configuración de variables de entorno y Cloudinary SDK.
- `src/api/v1/models/`: Esquemas de Mongoose con índices y hooks de pre-guardado.
- `src/api/v1/validations/`: Esquemas Joi y reglas Express-Validator para sanitización.
- `src/api/v1/middlewares/`: JWT, subida de archivos (Multer) y Rate Limiting.
- `src/api/v1/controllers/`: Validación de peticiones HTTP, parseo y formato de respuesta.
- `src/api/v1/services/`: Lógica de negocio y consultas hacia MongoDB.
- `src/api/v1/routes/`: Declaración y mapeo de rutas REST.

---

## 2. Variables de Entorno & Configuración

El archivo `.env` en la raíz del backend debe contener:

| Variable | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `PORT` | Número | Puerto local del servidor | `8000` |
| `HOST` | String | Interfaz de escucha | `0.0.0.0` |
| `API_URL` | String | Prefijo de la API REST | `/api/v1` |
| `CONNECTION_STRING` | String | URI de conexión a MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DATABASE` | String | Nombre de la base de datos | `LBM` |
| `JWT_SECRET` | String | Secreto criptográfico para firmar los JWT | `clave_secreta_super_segura` |
| `CLOUDINARY_CLOUD_NAME`| String | Cloud Name de Cloudinary | `deshvpfic` |
| `CLOUDINARY_API_KEY` | String | API Key de Cloudinary | `123456789...` |
| `CLOUDINARY_API_SECRET`| String | API Secret de Cloudinary | `abcde...` |
| `ADMIN_REGISTRATION_KEY`| String | Clave para proteger registro de nuevos admins | `admin_setup_secret_xyz` |

---

## 3. Modelos de Base de Datos (Mongoose Schemas)

### Modelo `User`
Representa a los administradores del panel de control.
- **Colección:** `users`
- **Campos:**
  - `nombre` (String, requerido, único, trim): Nombre de usuario del administrador (ej. `admin`).
  - `contraseña` (String, requerido, select: false): Contraseña encriptada con Bcrypt (salt = 10).
  - `createdAt`, `updatedAt` (Date, automático vía timestamps).
- **Hooks & Métodos:**
  - `pre('save')`: Hashea la contraseña automáticamente si fue modificada.
  - `comparePassword(candidatePassword)`: Compara una contraseña en texto plano contra el hash Bcrypt.

---

### Modelo `Client`
Representa a los compradores de la tienda online (e-commerce).
- **Colección:** `clients`
- **Campos:**
  - `firstName` (String, requerido, trim): Nombre del cliente.
  - `lastName` (String, requerido, trim): Apellidos del cliente.
  - `email` (String, requerido, único, trim, lowercase, indexado): Correo electrónico.
  - `password` (String, requerido, select: false): Contraseña con Bcrypt.
  - `phone` (String, requerido, trim): Teléfono de contacto.
  - `taxId` (String, trim, default: `""`): RFC / Identificación fiscal para facturación.
  - `address` (Object): Dirección principal:
    - `street` (String)
    - `city` (String)
    - `state` (String)
    - `postalCode` (String)
    - `country` (String)
  - `createdAt`, `updatedAt` (Date, automático).
- **Virtuals & Métodos:**
  - `virtual('name')`: Retorna `${this.firstName} ${this.lastName}`.
  - `comparePassword(candidatePassword)`: Verificación de contraseña.

---

### Modelo `Product`
Representa las prendas y artículos del catálogo de venta (mayoreo y menudeo).
- **Colección:** `products`
- **Campos:**
  - `sku` (String, requerido, único, uppercase, trim): Código SKU único (ej. `LBM-REM-001`).
  - `title` (String, requerido, trim): Nombre del producto (ej. `Playera Oversize Negra`).
  - `handle` (String, requerido, único): Slug URL-friendly (ej. `playera-oversize-negra`).
  - `description` (String, requerido): Descripción detallada de la prenda.
  - `price` (Number, requerido): Precio unitario en MXN (ej. `600`).
  - `currency` (String, default: `"MXN"`): Moneda del precio.
  - `image_url` (String, requerido): URL segura en Cloudinary.
  - `stock` (Boolean, default: `true`): Disponibilidad en inventario.
  - `category` (String, default: `"Componentes"`): Nombre de la categoría a la que pertenece.
  - `bgColor` (String, default: `"#FFFFFF"`): Color de fondo sugerido para la card de producto en el front.
  - `createdAt` (Date, default: `Date.now`).
- **Índices:**
  - `{ sku: 1, title: 'text' }` para búsquedas eficientes.

---

### Modelo `Category`
Gestiona las categorías de ropa (ej. Playeras, Sudaderas, Pantalones).
- **Colección:** `categories`
- **Campos:**
  - `name` (String, requerido, único, trim, min: 2, max: 50): Nombre de la categoría.
  - `description` (String, trim, max: 500): Descripción opcional.
  - `handle` (String, requerido, único): Slug generado automáticamente (ej. `ropa-de-hombre`).
  - `createdAt`, `updatedAt` (Date, automático).
- **Hooks:**
  - `pre('save')`: Genera automáticamente `handle` en minúsculas y reemplaza caracteres especiales por guiones.

---

### Modelo `Order`
Registra los pedidos generados por clientes en la tienda.
- **Colección:** `orders`
- **Campos:**
  - `client` (ObjectId -> Ref: `Client`, requerido): ID del cliente que realizó la compra.
  - `orderItems` (Array de objetos, requerido):
    - `product` (ObjectId -> Ref: `Product`, requerido).
    - `sku` (String, requerido).
    - `title` (String, requerido).
    - `quantity` (Number, requerido, min: 1).
    - `image_url` (String, requerido).
    - `price` (Number, requerido): Precio congelado al momento de la compra.
    - `size` (String, requerido): Talla de la prenda (ej. `CH`, `M`, `G`, `XL`).
  - `shippingAddress` (Object, requerido):
    - `address`, `city`, `postalCode`, `country` (Strings, requeridos).
    - `state` (String, opcional).
  - `itemsPrice` (Number, default: `0.0`): Subtotal calculado con promociones.
  - `taxPrice` (Number, default: `0.0`): Impuestos.
  - `shippingPrice` (Number, default: `0.0`): Costo de flete/envío.
  - `totalPrice` (Number, default: `0.0`): Total final del pedido.
  - `isPaid` (Boolean, default: `false`).
  - `paidAt` (Date, opcional).
  - `isDelivered` (Boolean, default: `false`).
  - `deliveredAt` (Date, opcional).
  - `status` (String, enum: `['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']`, default: `'Pending'`).
  - `createdAt`, `updatedAt` (Date, automático).

---

### Modelo `Alert`
Notificaciones internas del panel administrativo.
- **Campos:** `name` (String), `description` (String), `timestamps`.

---

## 4. Autenticación & Seguridad de Sesión

El backend implementa un sistema de **doble autenticación JWT**:

1. **Tokens Administrativos (`authToken`):**
   - Emitido en `/api/v1/auth/login`.
   - Payload: `{ id, nombre, role: 'admin' }`. Expiración: `3h`.
   - Se transporta en:
     - **Cookie HttpOnly:** `authToken` con `secure: true` y `sameSite: 'None'` (en prod).
     - **Authorization Header:** `Bearer <token>` (soporte universal para apps y llamadas REST).

2. **Tokens de Cliente (`clientAuthToken`):**
   - Emitido en `/api/v1/client/auth/login` y `/api/v1/client/auth/register`.
   - Payload: `{ id, email, role: 'client' }`. Expiración: `3h`.
   - Se transporta en:
     - **Cookie HttpOnly:** `clientAuthToken`.
     - **Authorization Header:** `Bearer <token>`.

---

## 5. Catálogo Completo de Endpoints

### Endpoints de Salud y Ping

#### `GET /ping` o `GET /api/v1/ping`
- **Acceso:** Público.
- **Propósito:** Health check para Render y monitorización de estado de la base de datos MongoDB.
- **Respuesta (200 OK):**
```json
{
  "status": "pong",
  "database": "Connected",
  "timestamp": "2026-10-12T19:00:00.000Z",
  "api_prefix": "/api/v1"
}
```

---

### Endpoints de Autenticación Admin

#### `POST /api/v1/auth/login`
- **Acceso:** Público (Protegido por Rate Limiter: máx 5 intentos / 15 min).
- **Body (JSON):**
```json
{
  "nombre": "admin",
  "contraseña": "tu_password"
}
```
- **Respuesta Exitosa (200 OK):**
  - Coloca cookie `authToken` HttpOnly.
```json
{
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "69462a275260295b4275e0ec",
    "nombre": "admin",
    "role": "admin"
  }
}
```
- **Errores:** `400 Bad Request` (campos faltantes), `401 Unauthorized` (credenciales incorrectas), `429 Too Many Requests`.

#### `POST /api/v1/auth/protected` (o `GET /api/v1/auth/protected`)
- **Acceso:** Requiere Admin Token (Cookie `authToken` o `Bearer <token>`).
- **Propósito:** Verificar si la sesión actual del panel de administración sigue activa.
- **Respuesta (200 OK):**
```json
{
  "message": "Acceso permitido, bienvenido admin"
}
```

#### `POST /api/v1/auth/change-password`
- **Acceso:** Requiere Admin Token.
- **Body (JSON):**
```json
{
  "oldPassword": "admin123",
  "newPassword": "nuevoPasswordSeguro99"
}
```
- **Respuesta (200 OK):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

#### `POST /api/v1/auth/logout`
- **Acceso:** Público / Autenticado.
- **Propósito:** Limpia la cookie `authToken` del navegador.
- **Respuesta (200 OK):**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

#### `POST /api/v1/auth/register`
- **Acceso:** Protegido (Requiere autenticación de admin previo o clave maestra de seguridad).
- **Body (JSON):**
```json
{
  "nombre": "nuevo_admin",
  "contraseña": "password_robusto"
}
```

---

### Endpoints de Autenticación Clientes

#### `POST /api/v1/client/auth/register`
- **Acceso:** Público (con Rate Limit).
- **Body (JSON):**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "miPassword123",
  "phone": "3111234567",
  "taxId": "PERJ900101XYZ",
  "address": {
    "street": "Av. México 123",
    "city": "Tepic",
    "state": "Nayarit",
    "postalCode": "63000",
    "country": "México"
  }
}
```
- **Respuesta (201 Created):**
  - Coloca cookie `clientAuthToken`.
```json
{
  "message": "Cliente registrado exitosamente.",
  "token": "eyJhbGciOiJIUzI1...",
  "client": {
    "_id": "67...",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "3111234567"
  }
}
```

#### `POST /api/v1/client/auth/login`
- **Acceso:** Público (con Rate Limit).
- **Body (JSON):**
```json
{
  "email": "juan@example.com",
  "password": "miPassword123"
}
```
- **Respuesta (200 OK):**
```json
{
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1...",
  "client": {
    "id": "67...",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "3111234567",
    "role": "client"
  }
}
```

---

### Endpoints de Clientes CRUD (Admin)

Todos estos endpoints requieren autenticación de Administrador (`authToken`):
- `GET /api/v1/clients?page=1&limit=10`: Lista paginada de clientes.
- `GET /api/v1/clients/:id`: Obtiene datos de un cliente específico.
- `POST /api/v1/clients`: Alta manual de cliente desde el panel admin.
- `PUT /api/v1/clients/:id`: Actualiza datos de un cliente.
- `DELETE /api/v1/clients/:id`: Elimina un cliente.

---

### Endpoints de Productos

#### `GET /api/v1/products`
- **Acceso:** Público.
- **Query Params:**
  - `page` (número, default: 1)
  - `limit` (número, default: 10)
  - `search` (string, busca por SKU o título de prenda)
  - `category` (string, filtra por nombre de categoría)
  - `sortBy` (string, ej. `price`, `createdAt`, `title`)
  - `sortOrder` (`asc` o `desc`)
- **Respuesta (200 OK):**
```json
{
  "products": [
    {
      "_id": "67a3...",
      "sku": "LBM-001",
      "title": "Playera Polo Blanca",
      "price": 600,
      "currency": "MXN",
      "image_url": "https://res.cloudinary.com/deshvpfic/image/upload/products/playeras/LBM-001.jpg",
      "stock": true,
      "category": "Playeras",
      "bgColor": "#F5F5F5",
      "description": "Playera 100% algodón peinado",
      "handle": "playera-polo-blanca"
    }
  ],
  "totalPages": 3,
  "currentPage": 1,
  "total": 28
}
```

#### `GET /api/v1/products/simple`
- **Acceso:** Público.
- **Propósito:** Retorna lista ligera de todos los productos activos (ideal para selectores, buscadores instantáneos del frontend y carritos).

#### `GET /api/v1/products/:id`
- **Acceso:** Público.
- **Respuesta (200 OK):** Detalle completo del producto.

#### `POST /api/v1/products`
- **Acceso:** Admin Token (`authToken`).
- **Content-Type:** `multipart/form-data`.
- **Form Fields:**
  - `sku` (String, requerido)
  - `title` (String, requerido)
  - `description` (String, requerido)
  - `price` (Number, requerido)
  - `category` (String, ID de la categoría en Mongo)
  - `stock` (Boolean, `"true"` o `"false"`)
  - `bgColor` (String hex, opcional)
  - `handle` (String slug, requerido)
  - `image` (Archivo Binario de Imagen, máx 10 MB).
- **Respuesta (201 Created):** Retorna el documento creado con su `image_url` en Cloudinary.

#### `PUT /api/v1/products/:id`
- **Acceso:** Admin Token.
- **Content-Type:** `multipart/form-data` o `application/json` (si no cambia la imagen).
- **Respuesta (200 OK):** Documento actualizado.

#### `DELETE /api/v1/products/:id`
- **Acceso:** Admin Token.
- **Acción:** Borra el producto en MongoDB y elimina automáticamente el asset asociado en Cloudinary.

---

### Endpoints de Categorías

- `GET /api/v1/categories`: Público. Lista todas las categorías ordenadas alfabéticamente.
- `GET /api/v1/categories/:id`: Público. Obtiene una categoría.
- `POST /api/v1/categories`: Admin Token. Crea una nueva categoría (genera su `handle` automáticamente).
  - Body: `{ "name": "Sudaderas", "description": "Prendas de abrigo" }`
- `PUT /api/v1/categories/:id`: Admin Token. Actualiza nombre o descripción.
- `DELETE /api/v1/categories/:id`: Admin Token. Elimina una categoría.

---

### Endpoints de Pedidos (`/orders`)

#### `POST /api/v1/orders`
- **Acceso:** Cliente Autenticado (`clientAuthToken` en cookie o Bearer).
- **Body (JSON):**
```json
{
  "orderItems": [
    {
      "product": "67a3...",
      "sku": "LBM-001",
      "title": "Playera Polo Blanca",
      "quantity": 2,
      "image_url": "https://res.cloudinary.com/...",
      "price": 600,
      "size": "M"
    }
  ],
  "shippingAddress": {
    "address": "Av. Insurgentes 450",
    "city": "Tepic",
    "state": "Nayarit",
    "postalCode": "63175",
    "country": "México"
  },
  "itemsPrice": 1000,
  "taxPrice": 0,
  "shippingPrice": 0,
  "totalPrice": 1000
}
```
- **Lógica de Precios Automática (Backend):**
  - El servidor recalcula y valida el total aplicando la promoción:
    - **Pares de prendas:** Se cobran a **$1,000 MXN el par** (promoción 2x1000).
    - **Prendas individuales impares:** Se cobran a **$600 MXN cada una**.
- **Respuesta (201 Created):** Objeto del pedido creado con estado `'Pending'`.

#### `GET /api/v1/orders`
- **Acceso:** Admin Token.
- **Query Params:** `page`, `limit`, `search` (búsqueda por ID de orden), `sortBy`, `sortOrder`.
- **Respuesta (200 OK):** Lista paginada con populate del cliente (`name`, `email`).

#### `GET /api/v1/orders/:id`
- **Acceso:** Admin Token.
- **Respuesta (200 OK):** Detalle completo del pedido con populate del cliente.

#### `PUT /api/v1/orders/:id/status`
- **Acceso:** Admin Token.
- **Body:** `{ "status": "Shipped" }` (Valores permitidos: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- **Respuesta (200 OK):** Pedido con estado actualizado; si es `Delivered` o `Paid`, se fijan automáticamente las fechas `deliveredAt` o `paidAt`.

#### `DELETE /api/v1/orders/:id`
- **Acceso:** Admin Token.
- **Respuesta (200 OK):** `{ "message": "Order deleted successfully" }`.

---

## 6. Flujo de Subida de Imágenes (Multer + Cloudinary)

1. El frontend envía una petición `POST` o `PUT` con `enctype="multipart/form-data"` y el campo `image`.
2. `multer.memoryStorage()` captura el archivo directamente en un buffer en RAM (`req.file.buffer`) para evitar escribir archivos temporales en el disco de Render (que es efímero).
3. `uploadImageStream(buffer, sku, categoryName)` abre un stream de escritura seguro hacia Cloudinary en la carpeta `products/{categoryName}/{sku}`.
4. Cloudinary procesa y optimiza la imagen y retorna la `secure_url`.
5. El backend almacena esa `secure_url` en el campo `image_url` del documento `Product` en MongoDB.
6. Si un producto se elimina (`DELETE`), el backend invoca `deleteImage(publicId)` en Cloudinary para mantener limpio el almacenamiento.

---

## 7. Reglas de Negocio Clave

1. **Precios y Promoción 2x1000 de LBM:**
   - Si un cliente compra 2 playeras -> Total = $1,000.
   - Si compra 3 playeras -> 2 por $1,000 + 1 por $600 = $1,600.
   - Si compra 4 playeras -> 2 pares x $1,000 = $2,000.
   - La regla se ejecuta tanto en el frontend como se valida estrictamente en `order.Service.js` para evitar alteraciones de precio malintencionadas por parte del cliente.
2. **SKU Único y en Mayúsculas:**
   - Los SKUs se normalizan siempre en mayúsculas (`uppercase: true` en Mongoose).
3. **Manejo de Stock:**
   - Si un producto tiene `stock: false`, sigue visible para consulta histórica pero el frontend del e-commerce desactiva el botón de agregar al carrito.

---

## 8. Buenas Prácticas para el Front (Admin & Store)

1. **Credenciales en peticiones Axios/Fetch:**
   - En Axios siempre incluir: `{ withCredentials: true }` para permitir que el navegador envíe y reciba las cookies HttpOnly (`authToken` y `clientAuthToken`).
   - Adicionalmente, incluir el token en el header `Authorization: Bearer <token>` para garantizar compatibilidad si las cookies de terceros están restringidas en el navegador del usuario.
2. **Manejo de Respuestas de Error:**
   - Si el servidor responde `401 Unauthorized` o `403 Forbidden`, el front debe redirigir a `/login` y limpiar cualquier estado local.
   - Si responde `429 Too Many Requests`, mostrar al usuario: *"Demasiados intentos, espera unos minutos antes de reintentar"*.
