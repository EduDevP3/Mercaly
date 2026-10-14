import rateLimit from 'express-rate-limit';

// Limitador general para toda la API REST (previene DoS y scraping abusivo)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // 300 peticiones por ventana de 15 minutos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Demasiadas peticiones desde esta IP, por favor intenta más tarde."
  }
});

// Limitador estricto para autenticación de Administradores
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 10 : 200, // Holgura para testing y dev local
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Demasiados intentos de acceso administrativo. Intenta de nuevo en 15 minutos."
  }
});

// Limitador para autenticación y registro de Clientes
export const clientAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 solicitudes de login o registro por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Demasiados intentos en cuenta de cliente. Intenta de nuevo en 15 minutos."
  }
});

// Limitador para creación de pedidos (evita spam de carritos/pedidos)
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // 15 pedidos cada 15 min por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Has alcanzado el límite de pedidos permitidos en este lapso. Espera unos minutos."
  }
});
