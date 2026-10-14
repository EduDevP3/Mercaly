import jwt from 'jsonwebtoken';
import config from '../../../config/config.js';

const SECRET_KEY = config.JWT_SECRET;

/**
 * Normaliza roles entre nomenclatura legacy y RBAC Multi-Tenant
 */
const normalizeRole = (role) => {
  if (role === 'admin') return 'store_admin';
  if (role === 'superadmin') return 'super_admin';
  return role;
};

/**
 * Middleware RBAC Multi-Tenant.
 * Soporta Header 'Authorization: Bearer <token>' y Cookie HttpOnly 'authToken'.
 * @param {Array<string>} rolesAllowed Lista de roles autorizados (['super_admin', 'store_admin'])
 */
export const requireAuth = (rolesAllowed = ['super_admin', 'store_admin']) => {
  return (req, res, next) => {
    let token = null;

    // 1. Obtener desde Header Authorization: Bearer
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fallback a Cookie HttpOnly
    if (!token && req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Token de autenticación requerido' },
      });
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const normalizedUserRole = normalizeRole(decoded.role);

      // Inyectar versión normalizada
      decoded.role = normalizedUserRole;
      decoded.userId = decoded.userId || decoded.id;

      if (!rolesAllowed.includes(normalizedUserRole)) {
        return res.status(403).json({
          success: false,
          data: null,
          error: { code: 'FORBIDDEN', message: 'Permisos insuficientes para acceder a este recurso' },
        });
      }

      req.user = decoded;
      req.userTk = decoded; // Retrocompatibilidad con controladores existentes
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: 'INVALID_TOKEN', message: 'Token inválido o expirado' },
      });
    }
  };
};

/**
 * Middleware legacy para compatibilidad con rutas existentes
 */
export const authenticateToken = requireAuth(['super_admin', 'store_admin']);

export default requireAuth;
