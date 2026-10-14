# TRIBUNA MX

Tienda de comercio electrónico de alto rendimiento construida con Next.js y Shopify.

## Características

- Next.js App Router
- Optimizado para SEO usando los metadatos de Next.js
- Componentes de servidor React (RSCs) y Suspense
- Estilizado con Tailwind CSS
- Pago y gestión con Shopify
- Modo claro/oscuro automático basado en la configuración del sistema

## Ejecución local

Necesitarás usar las variables de entorno definidas en `.env.example` para ejecutar Tribuna MX.

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Ejecutar en modo desarrollo:
   ```bash
   pnpm dev
   ```

Tu aplicación debería estar funcionando en [localhost:3000](http://localhost:3000/).

## Configuración de Shopify

Tribuna MX requiere un plan de Shopify compatible con la API de Storefront.

### Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

- `SHOPIFY_STORE_DOMAIN`: Tu dominio de Shopify (ej: `tu-tienda.myshopify.com`).
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: El token de acceso público de tu tienda.
- `SITE_NAME`: El nombre de tu sitio.

### Uso de Shopify como CMS

Tribuna MX está impulsado por Shopify de forma totalmente "headless":

- **Productos**: Solo se muestran los productos marcados como `Activos`. Los productos con la etiqueta `nextjs-frontend-hidden` se ocultarán en la navegación pero seguirán accesibles vía URL.
- **Colecciones**: Todas las colecciones disponibles se muestran como filtros en la página de búsqueda.
- **Páginas**: Utiliza una ruta dinámica `[page]` para mostrar contenido enriquecido desde Shopify.
- **Menús de navegación**: Los menús del encabezado y pie de página se controlan desde la sección de navegación de Shopify.
