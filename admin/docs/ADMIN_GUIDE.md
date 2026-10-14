# Guía del Panel de Administración - Mercaly (Catálogo Multi-Tenant)

Esta guía técnica y operativa documenta la arquitectura, configuración, componentes visuales, flujos de autenticación y módulos del panel administrativo de la plataforma multi-tenant **Mercaly**.

---

## 1. Tecnologías y Arquitectura

* **Framework Base**: React 16.13 / React 18 impulsado por Vite 8 (Rolldown engine) para compilación ultrarrápida.
* **Sistema de Diseño**: `@windmill/react-ui` con personalizaciones de Tailwind CSS v3 y soporte nativo de Modo Claro (`light`) y Modo Oscuro (`dark`).
* **Visualización de Datos y Métricas**: `recharts` 3.x para gráficas interactivas en SVG vectorial (`AreaChart`, `BarChart`, degradados lineales y `CustomTooltip` adaptativo al tema).
* **Generación de Código QR**: `qrcode` para renderizado en Canvas/PNG descargable para los comercios.
* **Iconografía Oficial**: Componentes SVG optimizados mediante `@svgr/webpack` / `vite-plugin-svgr` sin emojis provisionales.
* **Enrutamiento y Control de Roles**: `react-router-dom` v5 con `PrivateRoute`, Lazy Loading, Code Splitting y control de acceso estricto RBAC (`super_admin` vs `store_admin`).
* **Cliente HTTP**: `axios` con interceptores para inyección de token JWT Bearer y soporte de credenciales seguras (`withCredentials: true`).

---

## 2. Variables de Entorno (`.env`)

En la raíz del proyecto `admin/`, el archivo `.env` configura los endpoints de conexión:

```bash
# Conexión Backend Local
REACT_APP_API_URL=http://localhost:82/api/v1
VITE_API_URL=http://localhost:82/api/v1
VITE_LOCAL_API_URL=http://localhost:82/api/v1

# URL Base del Catálogo Público (Storefront Next.js)
VITE_STOREFRONT_URL=http://localhost:3002

# Conexión Backend Producción (Render)
# REACT_APP_API_URL=https://tribuna-back-nfl9.onrender.com/api/v1
# VITE_API_URL=https://tribuna-back-nfl9.onrender.com/api/v1
```

---

## 3. Comandos de Ejecución y Validación

* **Modo Desarrollo (HMR Ultrarrápido)**:
  ```powershell
  npm run dev
  # o npm start
  ```
  Servidor activo en `http://localhost:3000` con recarga instantánea (<300 ms).

* **Compilación para Producción**:
  ```powershell
  npm run build
  ```
  Genera el bundle minificado en `build/` en **~6 a 7 segundos** sin errores de tipado o módulos huérfanos.

* **Previsualización de Producción**:
  ```powershell
  npm run preview
  ```

---

## 4. Componentes Globales del Sistema

### a. Loader Nativo (`ThemedSuspense.jsx`)
* Componente central de carga del proyecto que implementa la animación concéntrica `lds-ripple` en color púrpura `#7e3af2`.
* Se adapta dinámicamente con `min-h-[50vh]` y modo oscuro (`dark:bg-gray-900`) para transiciones fluidas en todas las vistas (`SuperAdmin`, `Dashboard`, `Subscription`, `Categories`, `SingleProduct`, `SingleOrder`).

### b. Sidebar Unificado (`components/Sidebar/index.jsx`)
* Estructura unificada que integra tanto la vista de escritorio fija (`aside.lg:block`) como la versión móvil con animación deslizante (`Transition`) y telón de fondo (`Backdrop`).
* Corrige la duplicidad y resuelve la separación limpia de marca en el logo: `Mercaly` (o nombre configurable vía `VITE_APP_NAME`) seguido de `Super Admin` o el nombre del comercio.
* Rutas de navegación filtradas por rol vía `getSidebarRoutes(user?.role)`:
  * **Super Admin**: Una sola sección limpia: `"Super Admin"` (`/app/super-admin`).
  * **Store Admin**: Menú operativo de tienda (`Tablero`, `Productos`, `Categorías`, `Configuración`, `Mi Suscripción`).

### c. Generador de Código QR (`components/StoreQrModal.jsx`)
* Modal interactivo que toma el enlace público del storefront de la tienda (`/:slug`) y genera un código QR de alta resolución.
* Incluye botón para copiar el enlace al portapapeles y botón para descargar el archivo `.png` listo para imprimir en mostradores, mesas o publicidad.

---

## 5. Vistas y Módulos por Rol

### Vista 1: Consola Super Admin (`/app/super-admin`) — Control de Plataforma
Exclusiva para el dueño del SaaS (`role === 'super_admin'`):

1. **Tarjetas de Salud Global**:
   * **Tiendas Registradas**: Conteo global de inquilinos.
   * **Activas vs Suspendidas**: Relación de tiendas operando frente a pausadas por el Kill-Switch.
   * **Próximas a Vencer**: Tiendas con $\le 7$ días restantes para seguimiento de cobranza.
   * **Clics WhatsApp (Mes)**: Volumen total de pedidos iniciados en toda la plataforma.

2. **Telemetría con Recharts**:
   * **Tráfico Global y Clics a WhatsApp (Últimos 7 días)**: Área con doble curva degradada (visitas en morado `#7e3af2` y pedidos en verde `#0e9f6e`).
   * **Distribución de Tiendas por Plan**: Gráfica de barras comparativa entre niveles `FREE`, `BASIC`, `PRO` y `ENTERPRISE`.

3. **Tabla Maestra de Tiendas**:
   * **Buscador en Vivo**: Filtra en tiempo real por nombre de comercio o slug.
   * **Selector de Filtros de Estado**: Opciones `Todas`, `Activas`, `Por vencer (≤ 7d)`, `Suspendidas / Vencidas`.
   * **Kill-Switch Inmediato**: Interruptor interactivo en tiempo real que suspende o activa el acceso público de la tienda e invalida el caché en memoria de inmediato.
   * **Acciones por Tienda**:
     * *Ver Catálogo*: Enlace directo al storefront público (`/:slug`).
     * *Cobranza por WhatsApp*: Abre conversación con mensaje precargado personalizado con los días restantes exactos de la tienda.
     * *Auditar como Tienda (Impersonate)*: Inicia sesión instantánea como administrador de esa tienda sin requerir su contraseña (`POST /super-admin/stores/:id/impersonate`).
     * *Extender Suscripción*: Modal para sumar días adicionales (`+30 días` o personalizados).
     * *Editar Tienda*: Actualización de nombre, slug y teléfono de WhatsApp.

4. **Pestaña de Bases de Datos en MongoDB Atlas**:
   * Inventario de bases de datos y colecciones aisladas `tenant_<slug>`.
   * Formulario para aprovisionar físicamente la base de datos de un nuevo tenant con colecciones de `categories`, `products`, `orders` y `clients`.

---

### Vista 2: Tablero Store Admin (`/app/dashboard`) — Operación del Comercio
Exclusiva para el comerciante (`role === 'store_admin'`):

1. **Alerta Preventiva de Suscripción**:
   * Cuando restan $\le 5$ días de servicio, se despliega un banner superior de advertencia con botón directo de renovación a WhatsApp.

2. **Acciones Rápidas del Catálogo**:
   * Botón para abrir el catálogo público en una pestaña nueva.
   * Botón para copiar el enlace directo al portapapeles.
   * Botón para abrir el modal de Código QR para impresión.

3. **KPIs Reales del Modelo de Catálogo**:
   * **Visitas al Catálogo**: Visitas del mes con desglose de hoy.
   * **Pedidos a WhatsApp**: Prospectos que hicieron clic para enviar su pedido al chat comercial.
   * **Tasa de Interés / Conversión**: Porcentaje de compradores interesados sobre visitas totales.
   * **Estado de Suscripción**: Badge indicando los días restantes de servicio.

4. **Gráficas de Negocio con Recharts**:
   * **Tendencia de Visitas vs. Pedidos a WhatsApp (Últimos 7 días)**: Muestra el comportamiento diario del catálogo.
   * **Distribución del Catálogo por Categoría**: Gráfica de barras con la cantidad de prendas o artículos cargados por cada categoría.

5. **Embudos y Productos Estrella**:
   * Embudo de conversión paso a paso (Visitas $\rightarrow$ Vistos $\rightarrow$ Carrito $\rightarrow$ Pedidos WhatsApp).
   * Tabla con el Top de productos más visualizados y añadidos al carrito.

---

### Vista 3: Módulos Complementarios de Tienda

* **Catálogo de Productos (`/app/all-products` y `/app/add-product`)**: Alta y edición de productos asociados estrictamente a su `storeId` con subida a Cloudinary, precio, SKU y estado disponible/agotado.
* **Categorías (`/app/categories` y `/app/add-category`)**: Gestión de familias de productos con loader `ThemedSuspense` integrado.
* **Configuración (`/app/settings`)**: Actualización de contraseña, perfil del comercio y botón de diagnóstico de conectividad con MongoDB Atlas.
* **Mi Suscripción (`/app/subscription`)**: Panel de autoservicio para consultar consumo de catálogo (`productsCount / maxProducts`) y botón de renovación con soporte.

---

## 6. Despliegue en Netlify / Vercel

El proyecto incluye la regla de reescritura en `public/_redirects`:
```text
/*    /index.html   200
```
Permite que todas las rutas directas de React Router (ej. `/app/super-admin`, `/app/dashboard`) funcionen correctamente al recargar la página sin generar errores 404 en el servidor estático.
