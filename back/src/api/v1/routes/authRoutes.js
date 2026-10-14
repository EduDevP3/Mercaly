import { Router } from 'express';
import {
  login,
  register,
  changePassword,
  getProfile,
  updateProfile,
  getDashboardStats
} from '../controllers/auth.Controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import { loginLimiter } from '../middlewares/rateLimitMiddleware';
import config from '../../../config/config';

const router = Router();

/**
 * Middleware de seguridad: solo permite registrar administradores si
 * quien realiza la petición ya es un administrador autenticado O
 * si proporciona la clave maestra administrativa ('x-admin-key' o 'adminKey').
 */
const requireAdminOrMasterKey = (req, res, next) => {
  const masterKey = config.ADMIN_REGISTRATION_KEY;
  const providedKey = req.headers['x-admin-key'] || (req.body && req.body.adminKey);

  if (masterKey && providedKey && providedKey === masterKey) {
    return next();
  }

  return authenticateToken(req, res, (err) => {
    if (!err && req.userTk) {
      return next();
    }
    return res.status(403).json({
      message: 'Acceso denegado: Se requiere autorización de un administrador activo o la clave maestra del sistema.'
    });
  });
};

// Rutas de inicio de sesión y registro protegidas
router.post('/login', loginLimiter, login);
router.post('/register', loginLimiter, requireAdminOrMasterKey, register);

// Perfil de Administrador
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Métricas y estadísticas para Dashboard
router.get('/stats', authenticateToken, getDashboardStats);

// Cambio de contraseña
router.post('/change-password', authenticateToken, changePassword);

// Verificación de sesión activa
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Acceso permitido, bienvenido ${req.userTk.nombre}`, user: req.userTk });
});

router.post('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Acceso permitido, bienvenido ${req.userTk.nombre}`, user: req.userTk });
});

// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
  });

  res.status(200).json({ message: 'Sesión cerrada correctamente' });
});

export default router;