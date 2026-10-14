import jwt from 'jsonwebtoken';
import config from '../../../config/config';  // Importa la clave secreta desde la configuración

const SECRET_KEY = config.JWT_SECRET;  // Utilizamos la clave secreta desde la configuración

// Middleware para verificar el token en solicitudes protegidas de clientes
export const authenticateClientToken = (req, res, next) => {
  let token = req.cookies.clientAuthToken;  // Intentar obtener desde cookies

  // Fallback: Intentar obtener desde el header Authorization
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token de cliente no encontrado' });
  }

  // Verificar el token usando la clave secreta
  jwt.verify(token, SECRET_KEY, (err, client) => {
    if (err) {
      return res.status(403).json({ message: 'Token de cliente inválido o expirado' });
    }

    req.clientTk = client;  // Agregar el cliente al objeto de la solicitud
    console.log(`Client '${client.email}' accessed ${req.method} ${req.originalUrl}`);
    next();  // Continuar con la solicitud
  });
};
