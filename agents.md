AGENT.MD — NORMAS OPERATIVAS Y PROTOCOLO DE DESARROLLO
CLASIFICACIÓN: GOBERNANZA DE CÓDIGO Y COMPORTAMIENTO AUTÓNOMO
AUDIENCIA: AGENTES DE CODIFICACIÓN (LLMs), DESARROLLADORES SENIOR Y REVISORES DE CÓDIGO
NIVEL DE CUMPLIMIENTO: MANDATORIO Y SIN EXCEPCIONES

MISIÓN Y CONTEXTO DEL SISTEMA

Plataforma SaaS Multi-Tenant ligera y de alta eficiencia para catálogos e-commerce con checkout conversacional directo a WhatsApp, sin intermediación de pasarelas de pago tradicionales.

Topología: Monorepo o arquitectura dual desacoplada.

Backend: Node.js + Express + TypeScript + MongoDB (Mongoose) alojado en Render (Capa gratuita optimizada).

Frontend: Next.js (App Router) + TypeScript + Tailwind CSS alojado en Vercel (Storefront dinámico + Dashboard Admin de Tienda + Consola Super Admin).

Regla Operativa Central: Costo de infraestructura tendiente a $0, máxima disponibilidad, cero consumo superfluo de CPU/RAM en Mongo Atlas y cero fugas de datos entre tiendas (Zero Cross-Tenant Leakage).

COMANDOS DE EJECUCIÓN, VALIDACIÓN Y PRUEBAS

Backend (/backend o /api):

Instalación limpia y determinista: npm ci

Modo desarrollo con recarga en caliente: npm run dev

Verificación de tipado estricto y compilación: npm run typecheck && npm run build

Batería de pruebas automatizadas (Unitarias y de Aislamiento): npm test && npm run test:coverage

Análisis estático y formateo: npm run lint && npm run lint:fix

Scripts de migración de esquema / inicialización: npx ts-node scripts/migrate-to-multitenant.ts

Frontend (/frontend o /storefront):

Instalación de dependencias: npm ci

Modo desarrollo: npm run dev

Chequeo de tipos estricto y compilación de producción: npm run typecheck && npm run build

Linters y auditoría de accesibilidad/estilo: npm run lint && npm run format:check

Pruebas unitarias de componentes y utilidades: npm test

DIRECTIVAS ARQUITECTURALES MANDATORIAS

3.1. Aislamiento Multi-Tenant Absoluto (Zero Data Leak)

Regla de Oro en Consultas: Ninguna operación de lectura (find, findOne), mutación (findOneAndUpdate, updateMany) o eliminación (deleteOne, deleteMany) ejecutada en el contexto de un store_admin puede prescindir del predicado { storeId: req.user.storeId }.

Métodos Prohibidos: Se prohíbe terminantemente el uso de findById, findByIdAndUpdate y findByIdAndDelete en cualquier endpoint administrativo de tienda. Utilizar siempre: Product.findOne({ _id: productId, storeId: req.user.storeId }).

Validación de Integridad Referencial: Antes de vincular categorías, imágenes o variantes a un producto, el controlador debe verificar que todas las entidades secundarias pertenezcan al mismo storeId.

3.2. Control de Acceso Basado en Roles (RBAC) y Jerarquía

super_admin: Control de ciclo de vida de tiendas, asignación de planes, suspensión/activación (isActive), edición de subscriptionExpiresAt y telemetría global. Consumo exclusivo de rutas /api/v1/super-admin/* y frontend /super-admin. Su campo storeId en el modelo User es estrictamente null.

store_admin: Encapsulado permanentemente a su storeId. Jamás puede leer, inferir o mutar datos de otra tienda ni elevar sus propios privilegios a super_admin. Consume /api/v1/admin/* y frontend /admin.

Público (Comprador Final): Acceso de solo lectura a catálogos a través de /api/v1/public/* resolviendo el slug de la tienda. Bloqueo total si la tienda tiene isActive === false o suscripción vencida.

3.3. Optimización para Recursos Limitados (Free Tier Guardrails)

Caché en Memoria para Resolución de Tenant: Las resoluciones de tienda por subdominio o path-slug deben implementar un caché en memoria (LRU Cache o Map nativo) con TTL de 5 minutos para evitar consultas repetitivas a MongoDB Atlas en visitas públicas.

Índices Compuestos Obligatorios: Toda colección asociada a un tenant debe poseer índices compuestos: Product ({ storeId: 1, slug: 1 } único y { storeId: 1, isPublished: 1, category: 1 }), Category ({ storeId: 1, slug: 1 } único), Store ({ slug: 1 } único y { isActive: 1, subscriptionExpiresAt: 1 }).

Manejo de Cold Starts (Render): El endpoint GET /health debe responder con código HTTP 200 y payload { status: "ok", timestamp: Date.now() } en menos de 5ms, sin tocar la base de datos, permitiendo pings de monitorización continua (UptimeRobot/Cron-Job).

3.4. Motor de Pedidos WhatsApp

Validación estricta de teléfonos en estándar E.164 sin símbolos ni signo + (ej. México: 521311XXXXXXX o 52311XXXXXXX).

Serialización de mensajes mediante encodeURIComponent. Se prohíbe la concatenación cruda de cadenas para evitar enlaces rotos o inyecciones en navegadores móviles.

Inclusión clara de desglose de variantes (tallas, colores), totales numéricos y datos de entrega del comprador.

ESTÁNDARES DE SEGURIDAD Y VALIDACIÓN DEFENSIVA

Tipado Estricto: Configuración de TypeScript con "strict": true, "noImplicitAny": true, "strictNullChecks": true. Prohibido el uso de any salvo wrappers genéricos debidamente justificados (usar unknown).

Validación en Frontera (Zod): Todo request body, query params y path params debe ser validado y sanitizado mediante esquemas Zod antes de ingresar al controlador.

Defensa contra Inyecciones NoSQL: Slugs restringidos a regex estricto /^[a-z0-9-]+$/. Sanitización de queries para neutralizar operadores maliciosos de MongoDB ($gt, $ne,$where, etc.).

Respuestas API Homogéneas:

Éxito: { "success": true, "data": T, "error": null }

Error: { "success": false, "data": null, "error": { "code": "STRING_CODE", "message": "Descripción", "details": [] } }

ESTRATEGIA DE PRUEBAS AUTOMATIZADAS (TESTING RIGUROSO)

Todo cambio arquitectónico o funcional debe respaldarse con pruebas automatizadas (Jest o Vitest). Ninguna tarea se considerará finalizada sin ejecutar y aprobar la suite de pruebas.

Pruebas de Aislamiento Multi-Tenant (Cross-Tenant Isolation): Verificar que el store_admin de la Tienda A reciba 404 Not Found al intentar consultar, modificar o eliminar un producto perteneciente a la Tienda B. Verificar que dos tiendas distintas puedan registrar productos con el mismo slug sin colisiones en MongoDB.

Pruebas del Kill-Switch y Suscripción: Verificar que al marcar isActive: false o al superar la fecha subscriptionExpiresAt, las rutas públicas del catálogo respondan con 403 STORE_SUSPENDED y el Storefront muestre la vista de pausa amigable.

Pruebas de Roles y Permisos (RBAC): Intentos de un store_admin accediendo a endpoints /api/v1/super-admin/* deben retornar inmediatamente 403 Forbidden. Intentos de acceso sin token o con token expirado deben retornar 401 Unauthorized.

Pruebas Unitarias del Generador de WhatsApp: Probar escenarios de variantes múltiples, ausencia de notas, caracteres con acentos, emojis y teléfonos con formatos irregulares.

6. PROTOCOLO OBLIGATORIO DE DOCUMENTACIÓN POR PROYECTO (.MD)

La documentación NO debe dispersarse globalmente de forma genérica; debe crearse y mantenerse **POR PROYECTO** dentro de la carpeta `docs/` de cada módulo correspondiente (`back/docs/`, `admin/docs/`, `store/docs/`).

Todo archivo de documentación debe seguir estrictamente la estructura didáctica, visual y técnica del estándar de `back/API_GUIDE.md`:

6.1. Estructura y Estilo Visual Obligatorio (Estándar API_GUIDE.md):
- **Encabezado y Propósito**: Título h1 claro, propósito del documento, URLs base de ejecución (local y producción).
- **Flujo General**: Lista ordenada del flujo de interacción paso a paso (ej. Navegación -> Autenticación -> Carrito -> Checkout -> Webhooks).
- **Bloques de Endpoints**:
  - `Endpoint` y `Método HTTP` en negritas.
  - `Autenticación`: Declarar explícitamente si es Público, Admin Token o Client Token, y si se envía por Cookie HttpOnly o Header Bearer.
  - `Descripción`: Objetivo funcional exacto.
  - `Query Params / Headers`: Parámetros detallados con tipos de datos y valores por defecto.
  - `Body (raw/json)`: Bloque de código JSON con datos de ejemplo realistas.
  - `Respuesta Exitosa (con código HTTP)`: Bloque JSON completo con la estructura de respuesta que emite el backend.
  - `Códigos de Error`: Mapeo de errores comunes (400, 401, 403, 404, 429).
- **Notas Técnicas Críticas al Pie**: Advertencias indispensables sobre configuración de CORS (`credentials: true`), manejo de cookies HttpOnly (`SameSite`, `Secure`) y variables de entorno.

6.2. Distribución de Archivos por Proyecto:
- **Backend (`back/docs/`)**:
  - `back/docs/API_DOCUMENTATION.md`: Referencia exhaustiva de endpoints, schemas y flujo de datos.
  - `back/docs/SECURITY_AND_MONGO.md`: Manual de auditoría de seguridad, sanitización NoSQL, rate limits y pipeline multimedia (Cloudinary).
- **Frontend Panel Admin (`admin/docs/`)**:
  - `admin/docs/ADMIN_GUIDE.md`: Arquitectura del dashboard (Vite 8), variables `.env`, pantallas operativas (Profile, Settings, Products, Orders, Customers) y despliegue en Netlify.
- **Frontend Tienda Store (`store/docs/`)**:
  - `store/docs/STORE_GUIDE.md`: Catálogo público, carrito, promociones mayoreo (2x1000) y checkout conversacional WhatsApp.

6.3. Registro Maestro y Matriz de Features (`PROJECT_FEATURES.md`):
- Ubicación: Raíz del repositorio (`PROJECT_FEATURES.md`).
- **REGLA DE ORO DE DESARROLLO (MANDATORIA Y SIN EXCEPCIONES)**:
  - Todo cambio funcional, adición de endpoints, componentes visuales, directivas de negocio o nuevas features DEBE documentarse obligatoriamente en `PROJECT_FEATURES.md`.
  - El agente debe mantener auditada la tabla del módulo correspondiente (Super Admin, Store Admin, Storefront, Backend) e insertar la versión y detalle en el **Registro Histórico de Cambios (Changelog)**.
  - Ninguna tarea se considerará concluida si no ha reflejado sus cambios en este documento maestro.

7. FLUJO DE TRABAJO Y COMPORTAMIENTO DEL AGENTE

Inspección Previa: Analizar el árbol de archivos existente, dependencias en package.json y modelos actuales antes de generar código nuevo o alterar rutas.

Desarrollo Incremental: Realizar cambios modulares y atómicos (Base de datos -> Middlewares -> Controladores -> Rutas -> UI).

Validación Automática: Antes de dar una tarea por concluida, ejecutar localmente los comandos de compilación (npm run build) y pruebas (npm test). No entregar código con errores de TypeScript o advertencias críticas de lint.

Preservación Funcional: No eliminar funcionalidades preexistentes (como carga de imágenes a almacenamiento en la nube o edición de precios) salvo que hayan sido expresamente marcadas para sustitución.

Generación y Actualización de Bitácoras Markdown: Registrar y auditar cada feature y cambio funcional en `PROJECT_FEATURES.md` (Sección 6.3) y redactar la documentación técnica del módulo modificado (`back/docs/`, `admin/docs/`, `store/docs/`) como paso final e indispensable de cada entrega.