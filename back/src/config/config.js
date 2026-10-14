import dotenv from 'dotenv';
dotenv.config();

// Sanitizar JWT_SECRET removiendo posibles comillas o punto y coma accidentales
const rawJwtSecret = process.env.JWT_SECRET || 'MERCALY_MASTER_JWT_SECRET_2026';
const cleanJwtSecret = rawJwtSecret.replace(/['";]/g, '').trim();

export default {
    NODE_ENV: process.env.NODE_ENV || 'development',
    HOST: process.env.HOST || '0.0.0.0',
    PORT: process.env.PORT || 82,
    API_URL: process.env.API_URL || '/api/v1',
    APP_NAME: process.env.APP_NAME || 'Mercaly',

    // MongoDB Atlas (Conexión Clúster y Base Maestra)
    CONNECTION_STRING: process.env.CONNECTION_STRING || '',
    DATABASE: process.env.DATABASE || 'mercaly',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',

    // Seguridad y Autenticación
    JWT_SECRET: cleanJwtSecret,
    ADMIN_REGISTRATION_KEY: process.env.ADMIN_REGISTRATION_KEY || 'MERCALY_ADMIN_MASTER_SETUP_2026',

    // Configuración Multi-Tenant y Super Admin
    DEFAULT_STORE_SLUG: process.env.DEFAULT_STORE_SLUG || 'demo-store',
    SUPER_ADMIN_WHATSAPP: process.env.SUPER_ADMIN_WHATSAPP || '523221045519',
    SUPER_ADMIN_DEFAULT_EMAIL: process.env.SUPER_ADMIN_DEFAULT_EMAIL || 'superadmin@mercaly.local',

    // Orígenes Permitidos (CORS)
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    STORE_URL: process.env.STORE_URL || 'http://localhost:3001',

    // Cloudinary (Multimedia)
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};
