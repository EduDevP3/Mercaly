// src/api/v1/routes/clientAuth.Routes.js
import { Router } from 'express';
import { loginClient, registerClient } from '../controllers/clientAuth.Controller';
import { clientAuthLimiter } from '../middlewares/rateLimitMiddleware';

const router = Router();

// Rutas de autenticación de clientes protegidas por rate limiting
router.post('/register', clientAuthLimiter, registerClient);
router.post('/login', clientAuthLimiter, loginClient);

// Cierre de sesión de cliente (limpia cookie clientAuthToken)
router.post('/logout', (req, res) => {
  res.clearCookie('clientAuthToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });
  res.status(200).json({ message: 'Sesión de cliente cerrada correctamente' });
});

export default router;
