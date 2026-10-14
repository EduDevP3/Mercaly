# Guía Completa de API REST - LBM (La Barata Mayoreos)

Esta guía describe todos los endpoints, flujos de autenticación, modelos y parámetros de la API REST del backend para la integración con el frontend Store y el panel Admin.

---

## Información del Servidor
* **URL Base en Producción**: `https://tribuna-back-nfl9.onrender.com/api/v1`
* **URL Base Local**: `http://localhost:8000/api/v1`
* **Health Check**: `GET /ping` o `GET /api/v1/ping`
* **Base de Datos**: MongoDB Atlas (`LBM`)
* **Manejo de Multimedia**: Cloudinary (`lbm/products/{SKU}`)

---

## Flujo General del Sistema

1. **Catálogo Público**: La tienda Store consulta productos (`/products`) y categorías (`/categories`) sin autenticación.
2. **Autenticación Dual**:
   * **Clientes (Store)**: Se registran en `/client/auth/register` o inician sesión en `/client/auth/login`. Reciben la cookie `clientAuthToken` y el token en el JSON.
   * **Administradores (Admin)**: Inician sesión en `/auth/login`. Reciben la cookie `authToken` y el token en el JSON.
3. **Creación de Pedidos**: Los clientes autenticados envían su carrito a `POST /orders`. El backend recalcula y valida la promoción 2x1000 ($1,000 por 2 prendas / $600 por prenda individual).
4. **Gestión Administrativa**: Los administradores consultan métricas en `/auth/stats`, gestionan pedidos en `/orders`, actualizan stock y suben imágenes a Cloudinary en `/products`.

---

## 1. Endpoints de Salud y Diagnóstico

### a. Ping de Monitoreo
* **Endpoint**: `GET /api/v1/ping` (o `GET /ping`)
* **Método**: `GET`
* **Autenticación**: Ninguna (Público)
* **Descripción**: Verifica que el servidor Express y el clúster de MongoDB Atlas estén activos.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "status": "pong",
    "database": "Connected",
    "timestamp": "2026-10-12T19:00:00.000Z",
    "api_prefix": "/api/v1"
  }
  ```

---

## 2. Endpoints de Autenticación de Administradores

### a. Inicio de Sesión de Administrador
* **Endpoint**: `POST /api/v1/auth/login`
* **Método**: `POST`
* **Protección**: Rate Limiter (máximo 5 intentos por cada 15 minutos).
* **Body (raw/json)**:
  ```json
  {
    "nombre": "admin",
    "contraseña": "tu_password_seguro"
  }
  ```
* **Respuesta Exitosa (200 OK)**: Establece la cookie `authToken` (HttpOnly, Secure, SameSite) y devuelve el objeto:
  ```json
  {
    "message": "Inicio de sesión exitoso",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "69462a275260295b4275e0ec",
      "nombre": "admin",
      "email": "admin@labaratamayoreos.mx",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      "role": "admin",
      "phone": "3111234567",
      "bio": "Administrador general"
    }
  }
  ```

### b. Obtener Perfil del Administrador
* **Endpoint**: `GET /api/v1/auth/profile`
* **Método**: `GET`
* **Autenticación**: **Requerida** (Cookie `authToken` o Header `Authorization: Bearer <token>`).
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "user": {
      "id": "69462a275260295b4275e0ec",
      "nombre": "admin",
      "email": "admin@labaratamayoreos.mx",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      "role": "admin",
      "phone": "3111234567",
      "bio": "Administrador general",
      "createdAt": "2025-12-20T04:46:31.135Z"
    },
    "status": 200
  }
  ```

### c. Actualizar Perfil del Administrador
* **Endpoint**: `PUT /api/v1/auth/profile`
* **Método**: `PUT`
* **Autenticación**: **Requerida**.
* **Body (raw/json)**:
  ```json
  {
    "nombre": "admin_lbm",
    "email": "contacto@labaratamayoreos.mx",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    "phone": "3119876543",
    "bio": "Encargado de inventario y pedidos mayoreo"
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Perfil actualizado exitosamente",
    "user": {
      "id": "69462a275260295b4275e0ec",
      "nombre": "admin_lbm",
      "email": "contacto@labaratamayoreos.mx",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      "role": "admin",
      "phone": "3119876543",
      "bio": "Encargado de inventario y pedidos mayoreo"
    },
    "status": 200
  }
  ```

### d. Estadísticas Globales para Dashboard
* **Endpoint**: `GET /api/v1/auth/stats`
* **Método**: `GET`
* **Autenticación**: **Requerida**.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "stats": {
      "totalProducts": 45,
      "totalOrders": 128,
      "pendingOrders": 12,
      "totalClients": 84,
      "totalRevenue": 142000
    },
    "status": 200
  }
  ```

### e. Cambio de Contraseña de Administrador
* **Endpoint**: `POST /api/v1/auth/change-password`
* **Método**: `POST`
* **Autenticación**: **Requerida**.
* **Body (raw/json)**:
  ```json
  {
    "oldPassword": "password_actual",
    "newPassword": "nuevo_password_seguro_123"
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Contraseña actualizada exitosamente"
  }
  ```

### f. Cerrar Sesión
* **Endpoint**: `POST /api/v1/auth/logout`
* **Método**: `POST`
* **Descripción**: Limpia la cookie segura `authToken`.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Sesión cerrada correctamente"
  }
  ```

---

## 3. Endpoints de Productos

### a. Obtener Productos Paginados (Catálogo)
* **Endpoint**: `GET /api/v1/products`
* **Método**: `GET`
* **Autenticación**: Ninguna (Público)
* **Query Params (Opcionales)**:
  * `page` (número, defecto: 1)
  * `limit` (número, defecto: 10, máximo: 100)
  * `search` (string): Busca por SKU o Título de prenda.
  * `category` (string): Filtra por categoría.
  * `sortBy` (string, defecto: `_id`)
  * `sortOrder` (`asc` o `desc`, defecto: `desc`)
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "products": [
      {
        "_id": "67a3f8901234567890abcdef",
        "sku": "LBM-REM-001",
        "title": "Playera Polo Blanca",
        "price": 600,
        "currency": "MXN",
        "image_url": "https://res.cloudinary.com/.../lbm/products/LBM-REM-001.webp",
        "image_public_id": "lbm/products/LBM-REM-001",
        "stock": true,
        "category": "Playeras",
        "bgColor": "#FFFFFF",
        "description": "Playera de algodón peinado corte regular.",
        "handle": "playera-polo-blanca",
        "createdAt": "2026-02-14T20:00:00.000Z"
      }
    ],
    "totalPages": 5,
    "currentPage": 1,
    "total": 45
  }
  ```

### b. Obtener Lista Simple de Productos
* **Endpoint**: `GET /api/v1/products/simple`
* **Método**: `GET`
* **Autenticación**: Ninguna (Público)
* **Descripción**: Retorna lista ligera sin descripción larga para selectores rápidos y carritos.

### c. Obtener Producto por ID
* **Endpoint**: `GET /api/v1/products/:id`
* **Método**: `GET`
* **Autenticación**: Ninguna (Público)
* **Respuesta Exitosa (200 OK)**: Objeto completo del producto.

### d. Crear un Producto (Con Subida de Imagen a Cloudinary)
* **Endpoint**: `POST /api/v1/products`
* **Método**: `POST`
* **Autenticación**: **Requerida (Admin)**
* **Content-Type**: `multipart/form-data`
* **Form Fields**:
  * `sku` (string, obligatorio): Ej. `LBM-POLO-002`
  * `title` (string, obligatorio): Ej. `Playera Polo Negra`
  * `price` (número, obligatorio): Ej. `600`
  * `category` (string/id, obligatorio): Puede ser el `_id` de Mongo o el nombre de la categoría.
  * `description` (string, obligatorio): Descripción de la tela y corte.
  * `stock` (booleano, `"true"` o `"false"`): Disponibilidad.
  * `bgColor` (string hex, opcional): Ej. `#F3F4F6`
  * `image` (archivo binario, obligatorio): Archivo de imagen (JPG, PNG, WebP máx 10 MB).
* **Respuesta Exitosa (201 Created)**: Objeto del producto creado con su `image_url` y `image_public_id`.

### e. Actualizar un Producto
* **Endpoint**: `PUT /api/v1/products/:id`
* **Método**: `PUT`
* **Autenticación**: **Requerida (Admin)**
* **Content-Type**: `multipart/form-data` (si se sube nueva imagen) o `application/json`.
* **Descripción**: Si se envía una nueva imagen, sube la nueva a Cloudinary y borra automáticamente la anterior.
* **Respuesta Exitosa (200 OK)**: Objeto del producto actualizado.

### f. Eliminar un Producto
* **Endpoint**: `DELETE /api/v1/products/:id`
* **Método**: `DELETE`
* **Autenticación**: **Requerida (Admin)**
* **Descripción**: Elimina el registro en MongoDB y destruye la foto física en Cloudinary.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Producto e imagen eliminados exitosamente"
  }
  ```

---

## 4. Endpoints de Categorías

### a. Listar Categorías
* **Endpoint**: `GET /api/v1/categories`
* **Método**: `GET`
* **Autenticación**: Ninguna (Público)
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "categories": [
      {
        "_id": "67a3f123...",
        "name": "Playeras",
        "description": "Prendas de manga corta y cuello redondo o polo",
        "handle": "playeras"
      }
    ],
    "total": 6
  }
  ```

### b. Crear Categoría
* **Endpoint**: `POST /api/v1/categories`
* **Método**: `POST`
* **Autenticación**: **Requerida (Admin)**
* **Body (raw/json)**:
  ```json
  {
    "name": "Sudaderas",
    "description": "Prendas térmicas con capucha o cuello redondo"
  }
  ```
* **Respuesta Exitosa (201 Created)**: Genera automáticamente el slug `handle: "sudaderas"`.

### c. Actualizar Categoría (Con Actualización en Cascada)
* **Endpoint**: `PUT /api/v1/categories/:id`
* **Método**: `PUT`
* **Autenticación**: **Requerida (Admin)**
* **Descripción**: Si cambias el nombre de la categoría, el backend actualiza en cascada todos los productos vinculados.

### d. Eliminar Categoría
* **Endpoint**: `DELETE /api/v1/categories/:id`
* **Método**: `DELETE`
* **Autenticación**: **Requerida (Admin)**
* **Descripción**: Borra la categoría y reasigna los productos huérfanos a `"General"`.

---

## 5. Endpoints de Clientes y Autenticación de Tienda

### a. Registro de Cliente
* **Endpoint**: `POST /api/v1/client/auth/register`
* **Método**: `POST`
* **Body (raw/json)**:
  ```json
  {
    "firstName": "Carlos",
    "lastName": "Hernández",
    "email": "carlos@example.com",
    "password": "miPasswordSeguro123",
    "phone": "3111234567",
    "address": {
      "street": "Av. México 450",
      "city": "Tepic",
      "state": "Nayarit",
      "postalCode": "63000",
      "country": "México"
    }
  }
  ```
* **Respuesta Exitosa (201 Created)**: Establece cookie `clientAuthToken` y devuelve el objeto:
  ```json
  {
    "message": "Cliente registrado exitosamente.",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "client": {
      "_id": "67a30001...",
      "firstName": "Carlos",
      "lastName": "Hernández",
      "email": "carlos@example.com",
      "phone": "3111234567"
    }
  }
  ```

### b. Inicio de Sesión de Cliente
* **Endpoint**: `POST /api/v1/client/auth/login`
* **Método**: `POST`
* **Body (raw/json)**:
  ```json
  {
    "email": "carlos@example.com",
    "password": "miPasswordSeguro123"
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Inicio de sesión exitoso",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "client": {
      "id": "67a30001...",
      "firstName": "Carlos",
      "lastName": "Hernández",
      "email": "carlos@example.com",
      "phone": "3111234567",
      "role": "client"
    }
  }
  ```

---

## 6. Endpoints de Pedidos (Orders)

### a. Crear Pedido (Checkout)
* **Endpoint**: `POST /api/v1/orders`
* **Método**: `POST`
* **Autenticación**: **Requerida (Cliente)**. Se envía token mediante cookie `clientAuthToken` o `Authorization: Bearer <token>`.
* **Protección**: Rate Limiter (máx 15 pedidos / 15 min).
* **Body (raw/json)**:
  ```json
  {
    "orderItems": [
      {
        "product": "67a3f8901234567890abcdef",
        "quantity": 2,
        "size": "M"
      }
    ],
    "shippingAddress": {
      "address": "Av. Insurgentes 1200",
      "city": "Tepic",
      "state": "Nayarit",
      "postalCode": "63175",
      "country": "México"
    }
  }
  ```
* **Regla de Negocio (Promoción 2x1000)**:
  * El backend calcula el total automáticamente:
    * 2 playeras = $1,000 MXN.
    * 3 playeras = $1,600 MXN.
    * 4 playeras = $2,000 MXN.
* **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "_id": "67b900000000000000000001",
    "client": "67a30001...",
    "orderItems": [
      {
        "product": "67a3f8901234567890abcdef",
        "sku": "LBM-REM-001",
        "title": "Playera Polo Blanca",
        "quantity": 2,
        "price": 600,
        "size": "M",
        "image_url": "https://res.cloudinary.com/.../lbm/products/LBM-REM-001.webp"
      }
    ],
    "shippingAddress": {
      "address": "Av. Insurgentes 1200",
      "city": "Tepic",
      "postalCode": "63175",
      "country": "México"
    },
    "itemsPrice": 1000,
    "taxPrice": 0,
    "shippingPrice": 0,
    "totalPrice": 1000,
    "status": "Pending",
    "isPaid": false,
    "isDelivered": false,
    "createdAt": "2026-10-12T19:00:00.000Z"
  }
  ```

### b. Listar Pedidos (Panel Admin)
* **Endpoint**: `GET /api/v1/orders`
* **Método**: `GET`
* **Autenticación**: **Requerida (Admin)**
* **Query Params**: `page`, `limit`, `search` (ID de orden), `sortBy`, `sortOrder`.

### c. Actualizar Estado de Pedido
* **Endpoint**: `PUT /api/v1/orders/:id/status`
* **Método**: `PUT`
* **Autenticación**: **Requerida (Admin)**
* **Body (raw/json)**:
  ```json
  {
    "status": "Delivered"
  }
  ```
  *(Valores válidos: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`)*.

---

## 7. Configuración de CORS y Cookies en el Frontend

Para que el frontend en Netlify o Vercel pueda enviar y recibir cookies seguras en peticiones cruzadas a Render:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tribuna-back-nfl9.onrender.com/api/v1',
  withCredentials: true, // OBLIGATORIO para enviar y recibir cookies HttpOnly
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para enviar Bearer Token si la cookie está bloqueada por terceros
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 8. Arquitectura Multi-Tenant y Resolución de Tiendas

La plataforma opera bajo el modelo **SaaS Multi-Tenant**. Cada tienda posee su propio catálogo, inventario y configuración aislada.

### A. Cabecera de Tenant Público
Para consultar el catálogo público de una tienda específica, el frontend debe enviar la cabecera HTTP:
* **Header**: `x-tenant-slug: <slug-de-la-tienda>` (Ejemplo: `lbm-mayoreos`).
* **Fallback**: Si no se envía la cabecera, el backend asume la tienda por defecto configurada (`lbm-mayoreos`).

### B. Validación de Suscripción y Kill-Switch
Si la tienda se encuentra inactiva (`isActive: false`), con estatus `suspended`, o con la fecha `subscriptionExpiresAt` superada, los endpoints públicos responden con:
* **Código HTTP**: `403 Forbidden`
* **JSON de Respuesta**:
  ```json
  {
    "success": false,
    "data": null,
    "error": {
      "code": "STORE_SUSPENDED",
      "message": "Catálogo en mantenimiento temporal o suscripción pausada."
    }
  }
  ```

---

## 9. Módulo de Autoservicio de Suscripción (Store Admin)

### a. Consultar Estado de Cuenta y Vigencia
* **Endpoint**: `GET /api/v1/admin/subscription/status`
* **Método**: `GET`
* **Autenticación**: **Requerida (Role: `store_admin` o `super_admin`)**
* **Descripción**: Retorna la ficha técnica de vigencia del tenant del usuario autenticado, días restantes y conteo de productos utilizados respecto al límite de su plan.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "storeName": "La Barata Mayoreos (LBM)",
      "slug": "lbm-mayoreos",
      "plan": "pro",
      "status": "active",
      "isActive": true,
      "expiresAt": "2027-10-12T00:00:00.000Z",
      "daysRemaining": 365,
      "isExpiringSoon": false,
      "usage": {
        "productsCount": 2,
        "maxProducts": 500,
        "usagePercentage": 0.4
      },
      "billingSupportWhatsapp": "523221045519"
    },
    "error": null
  }
  ```

---

## 10. Endpoints de Gestión Maestro (Super Admin)

Todos los endpoints de este módulo están protegidos y requieren estrictamente el rol **`super_admin`**.

### a. Telemetría y Métricas Globales
* **Endpoint**: `GET /api/v1/super-admin/metrics`
* **Método**: `GET`
* **Autenticación**: **Requerida (`super_admin`)**
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalStores": 1,
      "activeStores": 1,
      "suspendedStores": 0,
      "expiringSoonStores": 0,
      "totalProducts": 2,
      "timestamp": "2026-10-12T20:00:00.000Z"
    },
    "error": null
  }
  ```

### b. Listar Todas las Tiendas
* **Endpoint**: `GET /api/v1/super-admin/stores`
* **Método**: `GET`
* **Autenticación**: **Requerida (`super_admin`)**
* **Descripción**: Retorna todas las tiendas con días restantes, límite de productos y estado de expiración.

### c. Crear Nueva Tienda y Usuario Administrador
* **Endpoint**: `POST /api/v1/super-admin/stores`
* **Método**: `POST`
* **Autenticación**: **Requerida (`super_admin`)**
* **Body (raw/json)**:
  ```json
  {
    "name": "Boutique Roma",
    "slug": "boutique-roma",
    "whatsappNumber": "5213111234567",
    "description": "Catálogo de ropa casual en CDMX",
    "subscriptionPlan": "basic",
    "subscriptionDays": 30,
    "maxProducts": 50,
    "adminNombre": "admin_roma",
    "adminEmail": "roma@boutique.com",
    "adminPassword": "PasswordSeguro2026!"
  }
  ```
* **Respuesta Exitosa (201 Created)**: Retorna el documento de la tienda creada y los datos del nuevo usuario `store_admin`.

### d. Modificar Plan o Extender Días de Suscripción
* **Endpoint**: `PATCH /api/v1/super-admin/stores/:id/subscription`
* **Método**: `PATCH`
* **Autenticación**: **Requerida (`super_admin`)**
* **Body (raw/json)**:
  ```json
  {
    "extendDays": 30,
    "subscriptionPlan": "pro",
    "maxProducts": 200
  }
  ```
* **Efecto Inmediato**: Invalida la entrada en memoria del caché (`storeCache`) para que el cambio surta efecto instantáneamente.

### e. Kill-Switch Inmediato (Pausar o Reactivar Tienda)
* **Endpoint**: `PATCH /api/v1/super-admin/stores/:id/kill-switch`
* **Método**: `PATCH`
* **Autenticación**: **Requerida (`super_admin`)**
* **Body (raw/json)**:
  ```json
  {
    "isActive": false
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "6acd3dbd9896614fc1e2fc89",
      "name": "La Barata Mayoreos",
      "slug": "lbm-mayoreos",
      "isActive": false
    },
    "error": null
  }
  ```

### f. Impersonar Tienda (Acceso Directo como Store Admin)
* **Endpoint**: `POST /api/v1/super-admin/stores/:id/impersonate`
* **Método**: `POST`
* **Autenticación**: **Requerida (`super_admin`)**
* **Descripción**: Emite un token JWT de sesión temporal con rol `store_admin` para la tienda indicada, permitiendo auditar o brindar soporte técnico en su panel sin requerir su contraseña.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "6acd3dbd9896614fc1e2fc99",
        "nombre": "acme_admin",
        "email": "admin@acme-store.com",
        "role": "store_admin",
        "storeSlug": "acme-store"
      }
    },
    "error": null
  }
  ```

### g. Telemetría y Métricas Globales para Gráficas
* **Endpoint**: `GET /api/v1/super-admin/metrics`
* **Método**: `GET`
* **Autenticación**: **Requerida (`super_admin`)**
* **Descripción**: Consolida métricas de inquilinos y genera las series temporales de 7 días y agregación por planes para consumo directo de componentes Recharts.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalStores": 3,
      "activeStores": 3,
      "suspendedStores": 0,
      "expiringSoonStores": 1,
      "totalWhatsappClicksMonth": 14,
      "planDistribution": [
        { "name": "PRO", "count": 3 }
      ],
      "globalActivityChart": [
        { "date": "2026-10-06", "label": "06/10", "visitas": 15, "clicsWhatsapp": 5 },
        { "date": "2026-10-12", "label": "12/10", "visitas": 33, "clicsWhatsapp": 11 }
      ]
    },
    "error": null
  }
  ```

### h. Inventario y Aprovisionamiento en MongoDB Atlas
* **Endpoint Inventario**: `GET /api/v1/super-admin/databases`
* **Endpoint Aprovisionar**: `POST /api/v1/super-admin/databases/provision`
* **Método**: `GET` / `POST`
* **Autenticación**: **Requerida (`super_admin`)**
* **Body Aprovisionamiento (raw/json)**:
  ```json
  {
    "slug": "nueva-tienda",
    "categories": [{ "name": "General", "handle": "general" }]
  }
  ```
* **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "tenantDb": "tenant_nueva-tienda",
      "collectionsCreated": ["categories", "products", "orders", "clients"]
    },
    "error": null
  }
  ```

---

## 11. Analíticas de Tienda (Store Admin)

### a. Telemetría de Catálogo y WhatsApp del Comercio
* **Endpoint**: `GET /api/v1/admin/analytics`
* **Método**: `GET`
* **Autenticación**: **Requerida (`store_admin`)**
* **Descripción**: Retorna los KPIs de catálogo (visitas, pedidos iniciados por WhatsApp, conversión), la vigencia de suscripción, embudos de conversión y las series para las gráficas Recharts del Tablero.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "kpis": {
        "visitsToday": 8,
        "visitsMonth": 34,
        "whatsappClicksToday": 3,
        "whatsappClicksMonth": 9,
        "conversionRate": 26.5,
        "activeProducts": 6,
        "maxProducts": 50
      },
      "store": {
        "name": "ACME Store México",
        "slug": "acme-store",
        "subscriptionExpiresAt": "2027-10-12T00:00:00.000Z"
      },
      "activityChart": [
        { "label": "06/10", "visitas": 12, "pedidosWhatsapp": 3 },
        { "label": "12/10", "visitas": 8, "pedidosWhatsapp": 3 }
      ],
      "categoryDistribution": [
        { "name": "ROPA", "value": 4 },
        { "name": "CALZADO", "value": 2 }
      ],
      "funnel": [
        { "step": "Visitas al Catálogo", "count": 34, "percent": 100 },
        { "step": "Pedidos por WhatsApp", "count": 9, "percent": 26 }
      ]
    },
    "error": null
  }
  ```

---

## 11. Optimización en Capa Gratuita (Render & Atlas)

### a. Endpoint Ultrarrápido de Keep-Alive (`/health`)
* **Endpoint**: `GET /health` (o `GET /api/v1/health`)
* **Tiempo de Respuesta**: `< 5ms` (sin tocar MongoDB Atlas).
* **Propósito**: Configurar pings en UptimeRobot o Cron-Job cada 10 minutos para evitar el Cold Start de la instancia en Render.
* **Respuesta (200 OK)**:
  ```json
  {
    "status": "ok",
    "timestamp": 1791678585514
  }
  ```

