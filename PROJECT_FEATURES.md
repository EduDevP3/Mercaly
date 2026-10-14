# PROJECT_FEATURES.MD — DOCUMENTO MAESTRO DEL PROYECTO Y MATRIZ DE FEATURES

**Clasificación**: Documento Maestro de Producto, Arquitectura y Registro de Features  
**Nombre Clave del Proyecto**: Mercaly (Plataforma de Catálogo Multi-Tenant)  
**Audiencia**: Agentes de IA (LLMs), Desarrolladores, Dueños de Producto y Operaciones  
**Nivel de Cumplimiento**: Mandatorio y de Actualización Continua Obligatoria  

---

## 1. Misión y Modelo de Negocio

**Mercaly** es una aplicación web **Multi-Tenant de catálogo y tienda virtual sencilla conectada a WhatsApp**, diseñada para máxima velocidad, simplicidad y alta eficiencia comercial:
* **Modelo de Conversión**: Catálogo digital de alta velocidad donde cada comercio dispone de su propio catálogo público (`/:slug`), permitiendo a los compradores navegar productos, armar su carrito y **cerrar sus pedidos directamente a través de WhatsApp**, eliminando comisiones y fricciones de pasarelas de pago tradicionales o registros forzados de cuenta.
* **Modelo de Negocio SaaS**: Suscripción recurrente por comercio (`FREE`, `BASIC`, `PRO`, `ENTERPRISE`), administrada centralmente por el **Super Admin** con control de vigencia, cuotas de productos y **Kill-Switch** en caliente.
* **Aislamiento Multi-Tenant**: Cada tienda opera en un entorno hermético sin filtración de datos (*Zero Cross-Tenant Leakage*), resolviendo dinámicamente el catálogo por subdominio o slug dedicado (`/:slug`).
* **Eficiencia de Costos**: Diseñado para operar con costo de infraestructura tendiente a **$0** (capa optimizada de Render + MongoDB Atlas M0 + Vercel/Netlify), aprovechando caché en memoria y consultas indexadas sin escaneo de colecciones completas (`COLLSCAN`).

---

## 2. Topología y Stack Tecnológico

```
                                      ┌──────────────────────────────────────────────┐
                                      │              COMPRADOR PÚBLICO               │
                                      │       Storefront Next.js (/:slug)            │
                                      └──────────────────────┬───────────────────────┘
                                                             │ Consulta catálogo / Pedido WhatsApp
                                                             ▼
┌───────────────────────────┐         ┌──────────────────────────────────────────────┐         ┌───────────────────────────┐
│     STORE ADMIN           │ ──────► │             BACKEND MULTI-TENANT             │ ◄────── │       SUPER ADMIN         │
│ Panel Tienda (/admin)     │         │        Express + Node.js + Atlas M0          │         │ Consola Maestra (/super-admin)
│ Vite 8 + Windmill UI      │         │     Caché LRU + RBAC + Telemetría Diaria     │         │ Vite 8 + Windmill UI      │
└───────────────────────────┘         └──────────────────────┬───────────────────────┘         └───────────────────────────┘
                                                             │
                                                             ▼
                                      ┌──────────────────────────────────────────────┐
                                      │             MONGODB ATLAS CLÚSTER            │
                                      │ Base Maestra (Multi-Tenant) + DBs (tenant_*) │
                                      └──────────────────────────────────────────────┘
```

* **Frontend Panel Administrativo (`/admin`)**:
  * React 16.13 / 18 con Vite 8 (Rolldown) y Tailwind CSS v3.
  * Windmill UI (`@windmill/react-ui`) con soporte dual de Modo Claro y Oscuro.
  * Recharts 3.x para analíticas interactivas en SVG.
  * `qrcode` para generación de códigos QR vectoriales y descarga en PNG.
  * Nombre de la plataforma desacoplado y configurable vía variable de entorno (`VITE_APP_NAME`).
* **Backend API (`/back`)**:
  * Node.js + Express con soporte ECMAScript Modules (ESM).
  * MongoDB Atlas mediante Mongoose con esquemas indexados y TTL caching en memoria.
  * Autenticación dual JWT Bearer + Cookies seguras HttpOnly (`SameSite`, `Secure`).
* **Frontend Storefront (`/store`)**:
  * Next.js (App Router) + TypeScript + Tailwind CSS con carrito optimizado y salida a WhatsApp.

---

## 3. Matriz Auditada de Features por Módulo

### 3.1. Consola Super Admin (`/app/super-admin`) — Control Maestro de Plataforma

| # | Feature | Estado | Descripción Funcional |
|---|---|---|---|
| **SA-01** | **Separación Estricta de Rol (RBAC)** | Auditado | Redirección forzosa. El `super_admin` (`storeId: null`) no puede aterrizar en el menú de una tienda individual; tiene consola exclusiva. |
| **SA-02** | **Salud Global de Plataforma (4 KPIs)** | Auditado | Tarjetas métricas de *Tiendas Registradas*, *Activas vs Suspendidas*, *Próximas a Vencer (≤ 7 días)* y *Clics WhatsApp del Mes*. |
| **SA-03** | **Telemetría con Recharts (7 Días)** | Auditado | Gráfica de área con degradado lineal (`#7e3af2` y `#0e9f6e`) que compara visitas consolidadas vs clics a WhatsApp de toda la plataforma día a día. |
| **SA-04** | **Distribución por Planes (Recharts)** | Auditado | Gráfica de barras que muestra la cantidad de tiendas agrupadas por plan contratado (`FREE`, `BASIC`, `PRO`, `ENTERPRISE`). |
| **SA-05** | **Buscador de Tiendas en Tiempo Real** | Auditado | Campo de búsqueda reactivo en cliente que filtra tiendas instantáneamente por nombre o por slug. |
| **SA-06** | **Filtros de Estado de Suscripción** | Auditado | Selector para aislar comercios: `Todas`, `Activas`, `Por vencer (≤ 7d)` y `Suspendidas / Vencidas`. |
| **SA-07** | **Kill-Switch Inmediato en Caliente** | Auditado | Interruptor visual en la tabla que suspende o reactiva una tienda en MongoDB Atlas e invalida su entrada en caché en memoria al instante. |
| **SA-08** | **Cobranza Directa por WhatsApp** | Auditado | Botón con `ChatIcon` que abre chat con el dueño del comercio con un mensaje precargado con el nombre de su tienda y días de servicio restantes. |
| **SA-09** | **Acceso Directo a Storefront Público** | Auditado | Botón con `EyeIcon` que abre el catálogo en vivo de la tienda seleccionada en una nueva pestaña (`/:slug`). |
| **SA-10** | **Auditoría / Impersonación (*Impersonate*)** | Auditado | Botón con `StoreIcon` que emite un token JWT de `store_admin` temporal para ingresar y administrar la tienda sin requerir su contraseña. |
| **SA-11** | **Extensión Rápida de Suscripción** | Auditado | Modal interactivo para sumar `+30`, `+60`, `+90` o `+365` días de servicio a cualquier comercio en un clic. |
| **SA-12** | **Edición Rápida de Datos** | Auditado | Modal para modificar el nombre, slug y número de WhatsApp de cualquier tienda. |
| **SA-13** | **Alta de Tienda (Formulario Depurado)** | Auditado | Modal con los 5 campos exactos requeridos, autogeneración de slug en minúsculas y creación del usuario administrador inicial. |
| **SA-14** | **Aprovisionamiento MongoDB Atlas** | Auditado | Pestaña de bases de datos que inspecciona clúster Atlas y permite aprovisionar la base física `tenant_<slug>` con colecciones iniciales. |
| **SA-15** | **Sidebar Unificado con 1 Sola Sección** | Auditado | Barra lateral limpia con un único enlace `"Super Admin"`, eliminando secciones redundantes y cabecera de plataforma neutra y configurable. |

---

### 3.2. Panel Store Admin (`/app/dashboard`) — Operación del Comercio

| # | Feature | Estado | Descripción Funcional |
|---|---|---|---|
| **ST-01** | **KPIs Reales de Catálogo** | Auditado | Métricas funcionales: *Visitas al Catálogo (mes y hoy)*, *Pedidos a WhatsApp (mes y hoy)*, *Tasa de Conversión/Interés* y *Días de Vigencia*. |
| **ST-02** | **Tendencia de Ventas (Recharts 7 Días)** | Auditado | Gráfica de área degradada de visitas vs pedidos a WhatsApp con `CustomTooltip` adaptativo a tema claro y oscuro. |
| **ST-03** | **Distribución por Categorías (Recharts)** | Auditado | Gráfica de barras mostrando qué categorías tienen mayor volumen de productos cargados. |
| **ST-04** | **Embudo de Conversión & Top Productos** | Auditado | Visualización porcentual de pasos de compra y tabla con los productos más vistos y más añadidos al carrito. |
| **ST-05** | **Alerta Preventiva de Vencimiento** | Auditado | Banner superior automático que se despliega si restan $\le 5$ días de servicio con botón de renovación inmediata por WhatsApp. |
| **ST-06** | **Acceso Directo y Copia de Enlace** | Auditado | Botones en Header y Tablero para abrir el catálogo público en una pestaña nueva o copiar su URL con confirmación toast. |
| **ST-07** | **Generador de Código QR (`StoreQrModal`)** | Auditado | Genera el código QR del catálogo con botón de copia de link y descarga en archivo PNG listo para impresión en mesas/mostradores. |
| **ST-08** | **Gestión de Catálogo de Productos** | Auditado | Listado (`/app/all-products`), alta (`/app/add-product`) y edición (`/app/edit-product/:id`) con Cloudinary, precio, SKU y estado disponible/agotado. |
| **ST-09** | **Gestión de Categorías** | Auditado | Creación, listado y edición de categorías asociadas a la tienda con loader `ThemedSuspense` integrado. |
| **ST-10** | **Módulo de Mi Suscripción (`/app/subscription`)** | Auditado | Panel de autoservicio que muestra plan actual, días restantes, barra de uso de catálogo (`productos / maxProducts`) y botón de soporte. |
| **ST-11** | **Loader Nativo Oficial (`ThemedSuspense`)** | Auditado | Reemplazo de textos provisionales por la animación concéntrica púrpura `lds-ripple` en todas las pantallas. |

---

### 3.3. Storefront Público (`/store`) — Experiencia del Comprador

| # | Feature | Estado | Descripción Funcional |
|---|---|---|---|
| **PB-01** | **Resolución por Slug (`/:slug`)** | Auditado | Resuelve dinámicamente la tienda consultando el endpoint público optimizado con caché en memoria. |
| **PB-02** | **Bloqueo Preventivo Kill-Switch** | Auditado | Si la tienda tiene `isActive: false` o su fecha de suscripción expiró, muestra pantalla amigable de servicio en pausa sin errores 500. |
| **PB-03** | **Navegación Rápida y Filtros** | Auditado | Catálogo responsivo con búsqueda instantánea y filtrado por familias de productos. |
| **PB-04** | **Carrito de Compras Conversacional** | Auditado | Selección de prendas/artículos, cantidades y cálculo de montos. |
| **PB-05** | **Checkout a WhatsApp Sanitizado** | Auditado | Genera enlace `https://wa.me/<telefono>?text=...` con codificación segura `encodeURIComponent`, desglose de productos y total estimado. |

---

### 3.4. Backend y Seguridad de Datos (`/back`)

| # | Feature | Estado | Descripción Funcional |
|---|---|---|---|
| **BK-01** | **Aislamiento Multi-Tenant Estricto** | Auditado | Todas las consultas y mutaciones de tienda aplican obligatoriamente `{ storeId: req.user.storeId }`. Prohibido `findById` directo en tiendas. |
| **BK-02** | **Caché en Memoria de Resolución de Tienda** | Auditado | Caché LRU / Map con TTL de 5 minutos para resolver visitas públicas al storefront a costo cero de base de datos. |
| **BK-03** | **Invalidación Reactiva de Caché** | Auditado | Cada edición de suscripción o Kill-Switch purga de inmediato la entrada en memoria con `invalidateStoreCache(slug)`. |
| **BK-04** | **Endpoint de Impersonación (`impersonateStore`)** | Auditado | `POST /api/v1/super-admin/stores/:id/impersonate` emite token JWT válido para acceso temporal a paneles de tienda. |
| **BK-05** | **Telemetría Agregada (`AnalyticsDaily`)** | Auditado | Colección de agregación por fecha y tienda para nutrir las gráficas de Recharts en el frontend. |
| **BK-06** | **Aprovisionamiento Físico de BDs Atlas** | Auditado | Función `seedTenantDatabase` que crea y siembra colecciones aisladas `tenant_<slug>` en clúster Atlas. |
| **BK-07** | **Endpoint Keep-Alive Ultrarrápido (`/health`)** | Auditado | Responde en menos de 5ms sin tocar MongoDB Atlas para pings de monitoreo y prevención de Cold Starts en Render. |

---

## 4. Registro Histórico de Cambios (Changelog de Features)

| Versión | Fecha | Módulo | Cambios y Features Incorporadas |
|---|---|---|---|
| **v1.0.0** | 2026-10-10 | Sistema | Arquitectura base Monorepo / Multi-Tenant, catálogo, pedidos y autenticación tradicional. |
| **v1.1.0** | 2026-10-11 | Admin / Back | Separación de roles `super_admin` vs `store_admin`. Creación del servicio de suscripciones y Kill-Switch básico. |
| **v1.2.0** | 2026-10-12 | Admin | Integración de Recharts para gráficos de telemetría de catálogo (WhatsApp y categorías). Corrección del tema claro/oscuro y eliminación total de emojis. |
| **v1.3.0** | 2026-10-12 | Admin | Unificación del Sidebar en `Sidebar/index.jsx` con 1 sola sección para Super Admin. Integración del loader oficial `ThemedSuspense` en todas las páginas. |
| **v1.4.0** | 2026-10-13 | Admin / Back | Incorporación del Buscador y Filtros en la tabla de tiendas, Enlace al catálogo público, Cobranza directa por WhatsApp con mensaje dinámico, Endpoint y botón de Impersonación (*Impersonate*), Generador de Código QR en alta resolución (`StoreQrModal`) y Banner preventivo de suscripción $\le 5$ días. Actualización de documentación técnica en `admin/docs/` y `back/docs/`. |
| **v1.5.0** | 2026-10-13 | Plataforma | Desacoplamiento total de marcas comerciales anteriores (LBM / Tribuna MX) y adopción del nombre clave **Mercaly**. Descripción 100% genérica como aplicación web multi-tenant de catálogo con checkout a WhatsApp, parametrización configurable del nombre de la plataforma y limpieza de interfaces, metadatos y documentación. |

---

## 5. Protocolo de Mantenimiento Obligatorio

> **REGLA DE ORO DE DESARROLLO (VINCULADA A AGENTS.MD)**:  
> Cada vez que se agregue una nueva feature, se modifique un flujo de negocio o se refactorice un módulo del sistema, es **obligatorio y sin excepciones** registrar y auditar el cambio en este archivo (`PROJECT_FEATURES.md`), actualizando la tabla del módulo correspondiente y añadiendo una entrada en el Registro Histórico de Cambios (Sección 4).
