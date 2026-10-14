# Guía de API para el Frontend - Carrito de Compras

Esta guía describe el flujo de trabajo y los endpoints de la API necesarios para implementar un carrito de compras en el frontend.

## Flujo General

1.  **Visualización de Productos**: El usuario navega por los productos.
2.  **Registro/Inicio de Sesión**: El usuario debe registrarse o iniciar sesión para poder crear una orden.
3.  **Creación de la Orden**: El usuario, con los productos en su carrito, procede a crear la orden.

---

## 1. Endpoints de Productos (Públicos)

Estos endpoints son públicos y no requieren autenticación.

### a. Obtener todos los productos (paginado)

-   **Endpoint**: `GET /api/v1/products`
-   **Método**: `GET`
-   **Descripción**: Devuelve una lista paginada de productos.
-   **Query Params (Opcionales)**:
    -   `page` (número): Número de página (defecto: 1).
    -   `limit` (número): Cantidad de productos por página (defecto: 10).
    -   `sortBy` (string): Campo por el cual ordenar (defecto: `createdAt`).
    -   `sortOrder` (string): `asc` o `desc` (defecto: `desc`).
    -   `category` (string): Filtra productos por el nombre de la categoría.
-   **Respuesta Exitosa (200 OK)**:
    ```json
    {
        "products": [
            {
                "_id": "60d0fe4f5311236168a109ca",
                "title": "Nombre del Producto",
                "description": "Descripción del producto.",
                "price": 99.99,
                "stock": 100,
                "category": {
                    "_id": "60d0fe4f5311236168a109c9",
                    "name": "Nombre de la Categoría"
                },
                "image_url": "http://example.com/image.jpg",
                "sku": "SKU123"
            }
        ],
        "totalPages": 5,
        "currentPage": 1,
        "total": 50
    }
    ```

### b. Obtener un producto por ID

-   **Endpoint**: `GET /api/v1/products/:id`
-   **Método**: `GET`
-   **Descripción**: Devuelve los detalles de un producto específico.
-   **Respuesta Exitosa (200 OK)**:
    ```json
    {
        "_id": "60d0fe4f5311236168a109ca",
        "title": "Nombre del Producto",
        "description": "Descripción del producto.",
        "price": 99.99,
        "stock": 100,
        "category": {
            "_id": "60d0fe4f5311236168a109c9",
            "name": "Nombre de la Categoría"
        },
        "image_url": "http://example.com/image.jpg",
        "sku": "SKU123"
    }
    ```

---

## 2. Endpoints de Autenticación de Clientes

Estos endpoints son para que los clientes se registren e inicien sesión.

### a. Registro de Cliente

-   **Endpoint**: `POST /api/v1/client/auth/register`
-   **Método**: `POST`
-   **Descripción**: Registra un nuevo cliente en el sistema.
-   **Body (raw/json)**:
    ```json
    {
        "firstName": "Juan",
        "lastName": "Pérez",
        "email": "juan.perez@example.com",
        "password": "password123",
        "phone": "1234567890",
        "address": {
            "street": "Calle Falsa 123",
            "city": "Springfield",
            "state": "Provincia",
            "postalCode": "12345",
            "country": "País"
        }
    }
    ```
-   **Respuesta Exitosa (201 Created)**:
    ```json
    {
        "message": "Cliente registrado exitosamente.",
        "token": "ey..."
    }
    ```

### b. Inicio de Sesión de Cliente

-   **Endpoint**: `POST /api/v1/client/auth/login`
-   **Método**: `POST`
-   **Descripción**: Inicia sesión para un cliente y devuelve un token de autenticación.
-   **Body (raw/json)**:
    ```json
    {
        "email": "juan.perez@example.com",
        "password": "password123"
    }
    ```
-   **Respuesta Exitosa (200 OK)**: El token se envía en una cookie `httpOnly` (`clientAuthToken`), y también en el cuerpo de la respuesta para tu conveniencia en el frontend.
    ```json
    {
        "message": "Inicio de sesión exitoso",
        "token": "ey...",
        "client": {
            "id": "60d0fe4f5311236168a109cb",
            "firstName": "Juan",
            "lastName": "Pérez",
            "email": "juan.perez@example.com",
            "phone": "1234567890",
            "role": "client"
        }
    }
    ```
- **Uso del Token**: Debes almacenar este token en el estado de tu aplicación (e.g., Context, Redux, Zustand) y enviarlo en la cabecera `Authorization` para las rutas protegidas.

---

## 3. Endpoint de Creación de Órdenes (Protegido)

Este endpoint requiere que el cliente esté autenticado.

### a. Crear una Orden

-   **Endpoint**: `POST /api/v1/orders`
-   **Método**: `POST`
-   **Autenticación**: **Requerida**. Debes enviar el `token` del cliente en la cabecera `Authorization` como `Bearer <token>`. La API también usa la cookie `clientAuthToken` que se establece en el login.
-   **Descripción**: Crea una nueva orden para el cliente autenticado.
-   **Body (raw/json)**:
    ```json
    {
        "orderItems": [
            {
                "product": "60d0fe4f5311236168a109ca", // ID del producto
                "quantity": 2
            },
            {
                "product": "60d0fe4f5311236168a109cc", // ID de otro producto
                "quantity": 1
            }
        ],
        "shippingAddress": {
            "street": "Calle Falsa 123",
            "city": "Springfield",
            "state": "Provincia",
            "postalCode": "12345",
            "country": "País"
        },
        "paymentMethod": "Credit Card" // O el método que se use
    }
    ```
-   **Respuesta Exitosa (201 Created)**:
    ```json
    {
        "_id": "60d1024b4742397448a033f2",
        "orderItems": [
            {
                "product": "60d0fe4f5311236168a109ca",
                "quantity": 2,
                "sku": "SKU123",
                "title": "Nombre del Producto",
                "image_url": "http://example.com/image.jpg",
                "price": 99.99
            }
        ],
        "client": "60d0fe4f5311236168a109cb",
        "shippingAddress": {
            "street": "Calle Falsa 123",
            "city": "Springfield",
            "state": "Provincia",
            "postalCode": "12345",
            "country": "País"
        },
        "itemsPrice": 199.98,
        "taxPrice": 29.99,
        "shippingPrice": 0,
        "totalPrice": 229.97,
        "status": "Pending",
        "createdAt": "2023-01-01T12:00:00.000Z"
    }
    ```

---
**IMPORTANTE**: Para la autenticación de la creación de la orden, el middleware `authenticateClientToken` espera el token en una cookie llamada `clientAuthToken`. Asegúrate de que el navegador envíe esta cookie en la solicitud. Si estás haciendo peticiones desde un cliente como Postman, debes añadir manualmente la cookie a la petición.

Si el frontend y el backend están en dominios diferentes, asegúrate de que la configuración de CORS en `SDback/src/app.js` permita el origen de tu frontend y tenga `credentials: true`.
```javascript
const corsOptions = {
  origin: ['http://localhost:3000', 'https://tu-frontend.com'], // Añade la URL de tu frontend
  credentials: true,
};
app.use(cors(corsOptions));
```
