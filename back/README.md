# SDback - Backend Solución Digital

Backend profesional para la gestión de productos, órdenes, clientes y autenticación de usuarios. Este proyecto expone una API RESTful construida con Node.js y Express, utilizando MongoDB como base de datos.

## Descripción

SDback es el núcleo del sistema Solución Digital. Provee servicios para:

*   **Gestión de Catálogo**: Administración de productos y categorías.
*   **Gestión de Órdenes**: Creación, seguimiento y actualización de estatus de pedidos.
*   **Gestión de Clientes**: Registro y administración de clientes.
*   **Autenticación y Seguridad**: Sistema de login dual (Administradores y Clientes) basado en JWT y Cookies HttpOnly.

## Tecnologías Utilizadas

*   **Core**: Node.js, Express.js
*   **Base de Datos**: MongoDB, Mongoose
*   **Autenticación**: JSON Web Tokens (JWT), Bcrypt, Cookie-Parser
*   **Validación**: Joi, Express-Validator
*   **Seguridad**: Helmet, Cors, Rate-Limit
*   **Archivos**: Multer, Cloudinary (para almacenamiento de imágenes)
*   **Utilidades**: Morgan (logging), Dotenv

## Instalación

### Requisitos

*   Node.js (v18 o superior recomendado)
*   MongoDB (Instancia local o Atlas)
*   Cuenta de Cloudinary (para subida de imágenes)

### Pasos de instalación

1.  **Clonar el repositorio:**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd SDback
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto y configura las siguientes variables (ver sección [Variables de Entorno](#variables-de-entorno)).

4.  **Iniciar el servidor en desarrollo:**

    ```bash
    npm run dev
    ```

5.  **Build para producción:**

    ```bash
    npm run build
    npm start
    ```

## Variables de Entorno

Asegúrate de definir las siguientes variables en tu archivo `.env`:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `PORT` | Puerto donde correrá el servidor | `8000` |
| `HOST` | Host del servidor | `localhost` |
| `API_URL` | Prefijo base para la API | `/api/v1` |
| `CONNECTION_STRING` | URI de conexión a MongoDB | `mongodb://localhost:27017/sd_db` |
| `JWT_SECRET` | Llave secreta para firmar tokens | `mi_secreto_super_seguro` |
| `NODE_ENV` | Entorno de ejecución (`development` o `production`) | `development` |
| `CLOUDINARY_CLOUD_NAME` | Nombre de cloud en Cloudinary | `...` |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | `...` |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | `...` |

## Arquitectura del Proyecto

El proyecto sigue una arquitectura en capas dentro de `src/`:

```
/src
  /api
    /v1
      /controllers   # Lógica de negocio y respuestas HTTP
      /routes        # Definición de endpoints y asociación con controladores
      /models        # Esquemas de Mongoose (Estructura de datos)
      /services      # Lógica compleja y acceso a base de datos
      /middlewares   # Interceptores (Auth, Uploads, RateLimit)
      /validations   # Esquemas de validación (Joi)
  /config            # Configuración de DB, variables de entorno, Cloudinary
```

## Modelos de Datos

### Product Model

Estructura de los productos en el inventario.

```javascript
{
  _id: ObjectId,
  sku: String,            // Único, Uppercase
  title: String,          // Título del producto
  handle: String,         // Slug único para URL
  description: String,    // Descripción detallada
  price: Number,          // Precio
  currency: String,       // Default: "MXN"
  image_url: String,      // URL de la imagen (Cloudinary)
  stock: Boolean,         // Disponibilidad
  category: String,       // Nombre de la categoría
  createdAt: Date
}
```

### Order Model

Representa un pedido realizado por un cliente.

```javascript
{
  _id: ObjectId,
  client: ObjectId (Client), // Referencia al cliente
  orderItems: [
    {
      product: ObjectId,     // Referencia al producto original
      sku: String,           // Snapshot del SKU
      title: String,         // Snapshot del Título
      quantity: Number,
      image_url: String,
      price: Number          // Precio al momento de la compra
    }
  ],
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String,
    state: String
  },
  itemsPrice: Number,      // Subtotal items
  taxPrice: Number,        // Impuestos
  shippingPrice: Number,   // Envío
  totalPrice: Number,      // Total final
  status: String,          // Enum: 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  isPaid: Boolean,
  createdAt: Date
}
```

### User Model (Admin)

Usuarios administradores del dashboard.

```javascript
{
  _id: ObjectId,
  nombre: String,          // Único
  contraseña: String,      // Hash (Bcrypt)
  createdAt: Date
}
```

### Client Model

Clientes finales de la tienda.

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,           // Único
  password: String,        // Hash (Bcrypt)
  phone: String,
  taxId: String,           // RFC/NIT (Opcional)
  address: {               // Dirección fiscal/principal
      street: String,
      city: String,
      ...
  }
}
```

### Category Model

Categorías para organizar productos.

```javascript
{
  _id: ObjectId,
  name: String,            // Único
  description: String,
  handle: String,          // Generado automáticamente desde name
  createdAt: Date
}
```

## Endpoints

Base URL: `/api/v1`

### 🔐 Autenticación (Admin)

#### Login Admin
**POST** `/auth/login`

Autentica a un administrador y establece la cookie `authToken`.

*   **Body:**
    ```json
    {
      "nombre": "admin",
      "contraseña": "password123"
    }
    ```

#### Register Admin
**POST** `/auth/register`

Registra un nuevo administrador.

*   **Body:**
    ```json
    {
      "nombre": "nuevo_admin",
      "contraseña": "password123"
    }
    ```

### 👤 Autenticación (Clientes)

#### Login Cliente
**POST** `/client/auth/login`

Autentica a un cliente y establece la cookie `clientAuthToken`.

*   **Body:**
    ```json
    {
      "email": "cliente@email.com",
      "password": "password123"
    }
    ```

#### Register Cliente
**POST** `/client/auth/register`

Registra un nuevo cliente.

*   **Body:**
    ```json
    {
      "firstName": "Juan",
      "lastName": "Perez",
      "email": "juan@email.com",
      "password": "segura123",
      "phone": "5551234567"
    }
    ```

### 📦 Productos

#### Obtener Productos
**GET** `/products`

Lista paginada de productos.
*   **Query Params:** `page`, `limit`, `search`, `category`, `sortBy` (ej: price), `sortOrder` (asc/desc).

#### Crear Producto (Admin)
**POST** `/products`

Requiere autenticación (`authToken`). Soporta imagen via `multipart/form-data`.

*   **Headers:** `Content-Type: multipart/form-data`
*   **Body (FormData):**
    *   `sku`: "PROD-001"
    *   `title`: "Producto Demo"
    *   `handle`: "producto-demo"
    *   `description`: "Descripción..."
    *   `price`: 100
    *   `stock`: true
    *   `image`: (Archivo binario)

#### Actualizar Producto (Admin)
**PUT** `/products/:id`

Requiere autenticación. Actualiza datos o imagen.

### 🛒 Órdenes

#### Crear Orden (Cliente)
**POST** `/orders`

Requiere autenticación de cliente (`clientAuthToken`). El cliente se asigna automáticamente desde el token.

*   **Body:**
    ```json
    {
      "orderItems": [
        {
          "product": "64f...",
          "sku": "SKU-1",
          "title": "Prod 1",
          "quantity": 2,
          "image_url": "http://...",
          "price": 500
        }
      ],
      "shippingAddress": {
        "address": "Calle 123",
        "city": "CDMX",
        "postalCode": "12345",
        "country": "Mexico",
        "state": "CDMX"
      },
      "itemsPrice": 1000,
      "totalPrice": 1000
    }
    ```

#### Listar Órdenes (Admin)
**GET** `/orders`

Lista todas las órdenes del sistema.

#### Actualizar Estatus (Admin)
**PUT** `/orders/:id/status`

*   **Body:**
    ```json
    { "status": "Shipped" }
    ```

### 📂 Categorías

#### Listar Categorías
**GET** `/categories`

#### Crear Categoría (Admin)
**POST** `/categories`

*   **Body:**
    ```json
    {
      "name": "Electrónica",
      "description": "Gadgets y más"
    }
    ```

## Flujo de Autenticación

El backend utiliza **Cookies HttpOnly** para manejar la sesión de forma segura.

1.  El cliente/admin envía sus credenciales (Login).
2.  Si son correctas, el servidor responde con un status 200 y setea una cookie (`authToken` o `clientAuthToken`) que contiene el JWT.
3.  El navegador envía esta cookie automáticamente en cada petición subsiguiente.
4.  No es necesario enviar headers manuales de `Authorization` (salvo que se cambie la configuración del frontend).
5.  Para Logout, se invoca el endpoint correspondiente que limpia la cookie.

## Manejo de Errores

Las respuestas de error siguen una estructura estándar:

**Status 400/404/500**

```json
{
  "message": "Mensaje descriptivo del error",
  "error": "Detalle técnico del error (opcional)"
}
```

## Ejemplos de Consumo

### cURL - Login de Admin

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{ "nombre": "admin", "contraseña": "password" }' \
-c cookies.txt
```

### Fetch (Frontend) - Crear Orden

```javascript
// Asegúrate de incluir 'credentials: include' para enviar las cookies
fetch('http://localhost:8000/api/v1/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include', // IMPORTANTE para enviar la cookie de sesión
  body: JSON.stringify({
    orderItems: [...],
    shippingAddress: {...},
    totalPrice: 1500
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Consideraciones de Seguridad

*   **Protección XSS**: Uso de cookies `HttpOnly` para evitar acceso a tokens desde JS.
*   **Rate Limiting**: Protección contra fuerza bruta en endpoints de login.
*   **Helmet**: Configuración de headers HTTP seguros.
*   **Validación Estricta**: Uso de `Joi` y `express-validator` para sanitizar entradas.
*   **CORS**: Configurado para dominios de confianza.

---
Generado automáticamente por Solución Digital Assistant.
