import jwt from 'jsonwebtoken';
import Store from '../models/storeModel.js';
import config from '../../../config/config.js';

// Caché en memoria con TTL de 5 minutos para optimizar el plan gratuito M0 de MongoDB Atlas
const storeCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Invalida manualmente la entrada del caché para una tienda específica
 * @param {string} slug Slug de la tienda a invalidar
 */
export const invalidateStoreCache = (slug) => {
  if (slug) {
    storeCache.delete(slug);
    console.log(`[Cache Invalidation] Caché purgado para tenant: ${slug}`);
  } else {
    storeCache.clear();
    console.log(`[Cache Invalidation] Caché global de tiendas purgado.`);
  }
};

/**
 * Normaliza roles entre nomenclatura legacy y RBAC Multi-Tenant
 */
const normalizeRole = (role) => {
  if (role === 'admin') return 'store_admin';
  if (role === 'superadmin') return 'super_admin';
  return role;
};

/**
 * Middleware para resolver el Tenant público y/o autenticado
 */
export const resolveTenant = async (req, res, next) => {
  // 1. Verificar si la petición contiene token de autenticación (Header o Cookie)
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      decoded.role = normalizeRole(decoded.role);
      decoded.userId = decoded.userId || decoded.id;
      req.user = decoded;
      req.userTk = decoded;

      // Si el usuario pertenece a una tienda específica (store_admin)
      if (decoded.storeId) {
        const cachedStore = storeCache.get(String(decoded.storeId));
        if (cachedStore && (Date.now() - cachedStore.cachedAt < CACHE_TTL_MS)) {
          req.store = cachedStore.store;
          return next();
        }

        const userStore = await Store.findById(decoded.storeId);
        if (userStore) {
          storeCache.set(String(decoded.storeId), { store: userStore, cachedAt: Date.now() });
          req.store = userStore;
          return next();
        }
      }
    } catch {
      // Si el token es inválido o expiró, continuamos como petición anónima/pública
    }
  }

  // 2. Extraer slug del header, query param o path param
  let slug = (req.headers['x-tenant-slug']) || req.params.storeSlug || req.query.storeSlug;

  // Si no se proporcionó y es super_admin, permitir continuar sin tienda fija
  if (!slug && req.user?.role === 'super_admin') {
    return next();
  }

  // Fallback a tienda por defecto en entornos de navegación pública
  if (!slug) {
    slug = process.env.DEFAULT_STORE_SLUG || 'demo-store';
  }

  if (!slug) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: 'TENANT_SLUG_REQUIRED', message: 'Identificador (slug) de tienda no proporcionado' },
    });
  }

  const cleanSlug = String(slug).toLowerCase().trim();
  const now = Date.now();
  let store = null;

  // 3. Consulta en caché
  const cached = storeCache.get(cleanSlug);
  if (cached && (now - cached.cachedAt < CACHE_TTL_MS)) {
    store = cached.store;
  } else {
    // 4. Consulta en MongoDB
    try {
      store = await Store.findOne({ slug: cleanSlug });
      if (store) {
        storeCache.set(cleanSlug, { store, cachedAt: now });
        storeCache.set(String(store._id), { store, cachedAt: now });
      }
    } catch (err) {
      console.error(`❌ Error buscando tenant ${cleanSlug}:`, err.message);
      return res.status(500).json({
        success: false,
        data: null,
        error: { code: 'DATABASE_ERROR', message: 'Error interno verificando la tienda' },
      });
    }
  }

  if (!store) {
    return res.status(404).json({
      success: false,
      data: null,
      error: { code: 'STORE_NOT_FOUND', message: `Tienda con slug '${cleanSlug}' no encontrada` },
    });
  }

  // 5. Validación de Vigencia y Kill-Switch
  const isExpired = new Date(store.subscriptionExpiresAt).getTime() < now;
  if (!store.isActive || store.subscriptionStatus === 'suspended' || isExpired) {
    return res.status(403).json({
      success: false,
      data: null,
      error: {
        code: 'STORE_SUSPENDED',
        message: 'Catálogo en mantenimiento temporal o suscripción pausada.',
      },
    });
  }

  // Inyectar el tenant en el objeto Request
  req.store = store;
  next();
};

export default resolveTenant;
