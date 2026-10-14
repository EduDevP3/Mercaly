import mongoose from 'mongoose';
import config from './config/config.js';
import Product from './api/v1/models/productModel.js';
import fs from 'fs';
import path from 'path';

const seedDatabase = async () => {
    try {
        // Conectar a la base de datos
        await mongoose.connect(config.CONNECTION_STRING, {
            dbName: config.DATABASE
        });
        console.log('✅ Conectado a la base de datos para seeding...');

        // Ruta al archivo products.json en el store
        const productsPath = path.resolve('..', 'store', 'data', 'products.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

        // Limpiar colección actual (opcional, pero recomendado para un seed limpio)
        await Product.deleteMany({});
        console.log('🗑️  Colección de productos limpiada.');

        // Insertar productos
        const baseUrl = 'https://tribuna-teal.vercel.app';
        const productsToInsert = productsData.map(p => ({
            ...p,
            sku: p.sku.toUpperCase(),
            image_url: p.image_url.startsWith('http') ? p.image_url : `${baseUrl}${p.image_url}`
        }));
        await Product.insertMany(productsToInsert);
        console.log(`🚀 ${productsToInsert.length} productos insertados con éxito.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el seeding:', error);
        process.exit(1);
    }
};

seedDatabase();
