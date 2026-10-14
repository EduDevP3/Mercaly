---
description: Normas operativas, gobernanza de código, aislamiento multi-tenant y matriz de features
globs: ["*"]
alwaysApply: true
---

# PROTOCOLO DE GOBERNANZA Y ARQUITECTURA DEL PROYECTO

1. **Aislamiento Multi-Tenant Estricto (Zero Cross-Tenant Leakage)**:
   - Toda consulta/mutación de tienda en el backend debe incluir `{ storeId: req.user.storeId }`.
   - Prohibido terminantemente `findById`, `findByIdAndUpdate` y `findByIdAndDelete` en endpoints de `store_admin`.

2. **Control de Acceso Basado en Roles (RBAC)**:
   - `super_admin`: Gestión de tiendas, planes, suspensión/activación y telemetría global en `/app/super-admin` y `/api/v1/super-admin/*`. Su `storeId` es estrictamente `null`.
   - `store_admin`: Encapsulado permanentemente a su tienda en `/app/dashboard` y `/api/v1/admin/*`.

3. **Gobernanza de Documentación de Features**:
   - Cada cambio funcional, nueva feature o refactorización DEBE registrarse y auditarse obligatoriamente en `PROJECT_FEATURES.md` (raíz del repositorio).
   - Documentación técnica por módulo mantenida en `back/docs/API_DOCUMENTATION.md` y `admin/docs/ADMIN_GUIDE.md`.

4. **Estética y Calidad de Código**:
   - Cero emojis en componentes de producción; uso exclusivo de SVG de Windmill UI.
   - Soporte estricto de Modo Claro y Modo Oscuro en todos los componentes.
   - Validación obligatoria con `npm run build` antes de dar por finalizada cualquier entrega.
