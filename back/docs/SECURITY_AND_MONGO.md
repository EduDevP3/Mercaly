# Guía de Seguridad, MongoDB Atlas y Manejo Multimedia - LBM Backend

Esta guía documenta la infraestructura de seguridad, la persistencia en MongoDB Atlas y el pipeline de imágenes en Cloudinary para el backend de LBM.

---

## 1. Protección contra Inyecciones NoSQL en MongoDB

En aplicaciones Express con Mongoose, los atacantes pueden enviar objetos JSON con operadores de MongoDB (`$gt`, `$ne`, `$where`, `$regex`) para saltarse autenticaciones o filtrar información confidencial.

### a. Middleware de Sanitización (`mongoSanitize.middleware.js`)
* **Ubicación**: `src/api/v1/middlewares/mongoSanitize.middleware.js`
* **Comportamiento**: Recorre recursivamente `req.body`, `req.query` y `req.params`.
* **Regla**: Elimina automáticamente cualquier clave que comience con el símbolo `$` o que contenga puntos (`.`).
* **Activación Global**:
  ```javascript
  app.use(mongoSanitize);
  ```

### b. Prevención de ReDoS (Regular Expression Denial of Service)
* **Utilidad**: `src/api/v1/utils/security.utils.js` $\rightarrow$ `escapeRegex(text)`
* **Problema**: Si un usuario envía caracteres especiales (`[`, `(`, `+`, `*`) en un parámetro de búsqueda (`?search=[abc`), una expresión regular sin sanear provocaba excepciones no controladas o bloqueaba el hilo de ejecución de Node.js.
* **Solución**:
  ```javascript
  export const escapeRegex = (text) => {
    if (typeof text !== 'string') return '';
    return text.trim().slice(0, 100).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };
  ```

### c. Validación Estricta de Identificadores (`ObjectId`)
* **Utilidad**: `isValidMongoId(id)`
* **Comportamiento**: Comprueba que el parámetro recibido cumpla con el formato canónico de 24 caracteres hexadecimales antes de ejecutar consultas en Mongoose (`findById`, `findByIdAndUpdate`, `findByIdAndDelete`), evitando excepciones `CastError`.

---

## 2. Estrategia de Rate Limiting (Límites por IP)

Para prevenir ataques de fuerza bruta, scraping masivo y abuso de la capa gratuita de Render y MongoDB Atlas:

| Limitador | Ventana de Tiempo | Máx. Peticiones | Rutas Aplicadas | Propósito |
|---|---|---|---|---|
| `apiLimiter` | 15 minutos | 300 peticiones | `/api/*` | Protección global anti-DoS y anti-scraping |
| `loginLimiter` | 15 minutos | 5 peticiones | `/api/v1/auth/login`, `/register` | Fuerza bruta en panel administrativo |
| `clientAuthLimiter` | 15 minutos | 10 peticiones | `/api/v1/client/auth/*` | Credential stuffing y spam de cuentas |
| `orderLimiter` | 15 minutos | 15 pedidos | `POST /api/v1/orders` | Prevención de spam de carritos y órdenes fantasma |

---

## 3. Pipeline Multimedia con Cloudinary (`lbm/products/{SKU}`)

### a. Flujo de Subida
1. El administrador envía un formulario con `enctype="multipart/form-data"`.
2. Multer almacena la imagen en RAM (`memoryStorage()`) con límite de **10 MB**.
3. `uploadImageStream(buffer, sku)` crea un stream directo a Cloudinary:
   * **Carpeta Destino**: `lbm/products`
   * **Identificador**: `${SKU.toUpperCase()}`
   * **Optimización**: Se aplican transformaciones automáticas de calidad y formato WebP/AVIF.
4. MongoDB persiste tanto `image_url` como `image_public_id: "lbm/products/LBM-001"`.

### b. Eliminación Atómica (`deleteImage`)
Al eliminar o actualizar una prenda, el backend recupera `image_public_id` y llama a `cloudinary.uploader.destroy(publicId)`. Esto garantiza que no queden archivos huérfanos ocupando almacenamiento en Cloudinary.

---

## 4. Integridad Referencial en Cascada (Categorías $\leftrightarrow$ Productos)

* **Al Renombrar una Categoría**: El servicio actualiza en una sola operación atómica (`updateMany`) todos los productos que pertenecían a esa categoría, evitando inconsistencias en los filtros del frontend.
* **Al Eliminar una Categoría**: Los productos vinculados no se borran; se reasignan automáticamente a la categoría canónica `"General"`.
