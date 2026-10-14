# Mercaly - Plataforma Web Multi-Tenant de Catálogo y Tienda Virtual

> **Arquitectura:** Monorepo (`admin`, `back`, `store`)  
> **Modelo de Negocio:** SaaS Multi-Tenant B2B/B2C  
> **Cierre de Ventas:** Conversacional vía WhatsApp directo  
> **Versión Actual:** v1.5.0

---

## 📌 Visión General
**Mercaly** es una plataforma web multi-tenant diseñada para que cualquier comercio, marca o emprendedor disponga de su propio catálogo virtual interactivo de productos con stock en tiempo real, variantes dinámicas (talla, color) y un flujo de compra optimizado sin fricción donde los pedidos se formalizan y cierran directamente por **WhatsApp**.

La plataforma opera bajo un modelo de suscripción por planes (`FREE`, `BASIC`, `PRO`, `ENTERPRISE`), garantizando aislamiento estricto de datos entre tiendas (`storeId`), panel de control para dueños de tienda y un módulo central de **Super Admin** con métricas globales y mecanismo de corte de servicio (**Kill-Switch**).

---

## 📁 Estructura del Monorepo

```bash
mercaly-monorepo/
├── admin/               # Panel Administrativo (React 18 + Vite + Tailwind CSS)
│   ├── src/             # Vistas de Dashboard, Productos, Tienda, Suscripción y Super Admin
│   └── docs/            # Manual operativo del panel administrativo
├── back/                # API RESTful Multi-Tenant (Node.js + Express + MongoDB Atlas)
│   ├── src/             # Controladores, modelos Mongoose, middlewares de aislamiento
│   ├── docs/            # Documentación exhaustiva de endpoints y autenticación
│   └── scripts/         # Herramientas de aprovisionamiento, seed y migración
├── store/               # Catálogo Público / Storefront (Next.js 14 App Router + Tailwind)
│   ├── app/             # Rutas dinámicas por slug (/[:slug]), categorías y resumen de pedido
│   └── docs/            # Guía técnica de renderizado y conversión
├── PROJECT_FEATURES.md  # Matriz maestra de requerimientos, auditoría y changelog
└── AGENTS.md            # Reglas de desarrollo y protocolo de gobernanza
```

---

## 🚀 Puesta en Marcha en Desarrollo

### 1. Variables de Entorno
Cada paquete cuenta con su respectivo archivo `.env.example`. Copia cada uno a `.env` y configura tus credenciales:
- `back/.env`: Conexión a MongoDB Atlas (`DATABASE=mercaly`), JWT Secret y credenciales Cloudinary.
- `admin/.env`: `VITE_API_URL=http://localhost:82/api/v1` y `VITE_APP_NAME=Mercaly`.
- `store/.env`: `NEXT_PUBLIC_API_URL=http://localhost:82/api/v1` y `SITE_NAME=Mercaly`.

### 2. Comandos de Ejecución
Desde la raíz del monorepo puedes ejecutar:

```bash
# Iniciar Backend API (Puerto 82)
npm run dev:back

# Iniciar Panel de Administración (Puerto 3000)
npm run dev:admin

# Iniciar Catálogo / Storefront (Puerto 3001)
npm run dev:store
```

---

## 📖 Documentación y Gobernanza
- Consulta [PROJECT_FEATURES.md](./PROJECT_FEATURES.md) para conocer la lista exhaustiva de features, roles de usuario, matriz de estado y el historial de versiones.
- Consulta [AGENTS.md](./AGENTS.md) para las directrices operativas de desarrollo.
