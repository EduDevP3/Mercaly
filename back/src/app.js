// Mercaly - Multi-Tenant Catalog API Application
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { mongoose } from './config/database.config';
import config from './config/config';
import routeAPI from './api/v1/routes/index';
import { mongoSanitize } from './api/v1/middlewares/mongoSanitize.middleware';
import { apiLimiter } from './api/v1/middlewares/rateLimitMiddleware';

const app = express();

app.set('port', config.PORT);
app.set('trust proxy', 1);

// 1. Cabeceras de Seguridad con Helmet optimizadas para API REST multiplataforma
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Desactivado para no interferir con endpoints JSON/Swagger
}));

// 2. Cookie Parser
app.use(cookieParser());

// 3. CORS Resiliente para Frontends en Netlify, Vercel, Render y Localhost
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones server-to-server, Postman, curl
    if (!origin) return callback(null, true);

    const allowedPatterns = [
      /localhost/,
      /127\.0\.0\.1/,
      /\.netlify\.app$/,
      /\.vercel\.app$/,
      /\.onrender\.com$/
    ];

    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    if (isAllowed) {
      return callback(null, true);
    }

    // Permitir orígenes para evitar bloqueos imprevistos en despliegues
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie', 'x-admin-key']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 4. Logger de Peticiones
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 5. Parseo de Cuerpos HTTP con límites seguros para prevenir Memory Exhaustion DoS
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 6. Protección contra Inyecciones NoSQL en MongoDB
app.use(mongoSanitize);

// 7. Rate Limiter General para la API
app.use('/api', apiLimiter);

// 8. Registro de Rutas de la API
routeAPI(app);

const api = config.API_URL;

// 9. Endpoint Ultrarrápido de Salud (< 5ms sin tocar MongoDB) para UptimeRobot / Render keep-alive
app.get(['/health', `${config.API_URL}/health`], (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// 10. Endpoint de Salud y Keep-Alive (Monitoreo de MongoDB Atlas)
app.get(['/ping', `${api}/ping`], (req, res) => {
  try {
    const dbStatus = (mongoose && mongoose.connection && mongoose.connection.readyState === 1) ? 'Connected' : 'Disconnected';
    res.status(200).json({
      status: 'pong',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      api_prefix: api
    });
  } catch (error) {
    console.error("❌ Ping error:", error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 10. Vista de Bienvenida en la Raíz
app.get(['/', `${api}`], (req, res) => {
  const appName = process.env.APP_NAME || 'Mercaly';
  res.send(
    `<h1>${appName} - Catálogo Multi-Tenant API</h1> <p>Status: Running</p><p>Prefix: <b>${api}</b></p><p>Documentación: <b>${api}/ping</b></p>`
  );
});

// 11. Manejador Global Centralizado de Errores (JSON Estructurado)
app.use((err, req, res, next) => {
  console.error("❌ Error capturado en Middleware Global:", err);

  // Manejo de error de tamaño excedido en Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'error',
      message: 'El archivo excede el tamaño máximo permitido (10MB).'
    });
  }

  // Manejo de JSON malformado
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'error',
      message: 'Cuerpo de la petición JSON malformado.'
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;
  const message = isProduction && statusCode === 500
    ? 'Ocurrió un error interno en el servidor.'
    : (err.message || 'Error interno del servidor.');

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

export default app;
