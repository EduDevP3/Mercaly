import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Store from '../src/api/v1/models/storeModel.js';
import User from '../src/api/v1/models/userModel.js';
import Product from '../src/api/v1/models/productModel.js';
import {
  getTenantDbConnection,
  getTenantModel,
  seedTenantDatabase,
} from '../src/config/tenantDbManager.js';

const seedAcmeStore = async () => {
  const uri = process.env.CONNECTION_STRING;
  const masterDbName = process.env.DATABASE || 'LBM';

  console.log('🚀 Iniciando Seeding de la Tienda ACME (Vercel Store) en MongoDB Atlas...');
  await mongoose.connect(uri, { dbName: masterDbName });
  console.log(`✅ Conectado a MongoDB Atlas (Base Maestra: ${masterDbName})`);

  try {
    const ACME_SLUG = 'acme-store';

    // 1. Limpieza de datos previos si existieran
    await Store.deleteOne({ slug: ACME_SLUG });
    await User.deleteOne({ nombre: 'acme_admin' });
    console.log(`🧹 Tienda previa '${ACME_SLUG}' limpiada en base maestra.`);

    // 2. Crear Store en la Base Maestra (LBM.stores)
    const acmeStore = await Store.create({
      name: 'ACME Store México',
      slug: ACME_SLUG,
      description: 'Tienda oficial de productos ACME inspirada en Vercel Commerce con checkout WhatsApp',
      whatsappNumber: '523221045519',
      logoUrl: 'https://cdn.shopify.com/s/files/1/0752/7691/9077/files/bag-1-dark.png',
      bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#000000',
      currency: 'MXN',
      isActive: true,
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días
      maxProducts: 100,
      billingNotes: 'Tienda ACME para demostración de catálogo Vercel Commerce',
    });
    console.log(`✅ Tienda ACME registrada en LBM.stores con ID: ${acmeStore._id}`);

    // 3. Crear Usuario store_admin para ACME
    const acmeAdmin = await User.create({
      nombre: 'acme_admin',
      email: 'admin@acmestore.com',
      contraseña: 'AcmePassword2026!',
      role: 'store_admin',
      storeId: acmeStore._id,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AcmeAdmin&backgroundColor=000000',
      phone: '523221045519',
      bio: 'Administrador oficial de ACME Store México (Vercel Commerce)',
    });
    console.log(`✅ Usuario acme_admin creado con contraseña: AcmePassword2026!`);

    // 4. Categorías de la Tienda Acme
    const acmeCategories = [
      { name: 'Apparel', handle: 'apparel', description: 'Playeras y sudaderas minimalistas de ACME' },
      { name: 'Bags', handle: 'bags', description: 'Mochilas y tote bags resistentes' },
      { name: 'Drinkware', handle: 'drinkware', description: 'Tazas y termos de cerámica mate' },
      { name: 'Headwear', handle: 'headwear', description: 'Gorras y accesorios para la cabeza' },
      { name: 'Accessories', handle: 'accessories', description: 'Stickers y accesorios de colección' },
    ];

    // 5. Productos Oficiales de Vercel Commerce (Acme Store)
    const acmeProducts = [
      {
        title: 'Acme Circles T-Shirt',
        name: 'Acme Circles T-Shirt',
        sku: 'ACME-TSHIRT-01',
        handle: 'acme-circles-t-shirt',
        slug: 'acme-circles-t-shirt',
        description: 'La playera clásica de ACME con logotipo circular geométrico al frente. 100% algodón hilado en anillos, corte regular y sensación ultra suave.',
        price: 600,
        basePrice: 600,
        category: 'Apparel',
        image_url: 'https://cdn.shopify.com/s/files/1/0752/7691/9077/files/t-shirt-1.png',
        images: [
          'https://cdn.shopify.com/s/files/1/0752/7691/9077/files/t-shirt-1.png',
          'https://cdn.shopify.com/s/files/1/0752/7691/9077/files/t-shirt-2.png'
        ],
        stock: true,
        storeId: acmeStore._id,
        variants: [
          { sku: 'ACME-TSHIRT-01-S', size: 'S', color: 'Black', price: 600, stock: 25 },
          { sku: 'ACME-TSHIRT-01-M', size: 'M', color: 'Black', price: 600, stock: 40 },
          { sku: 'ACME-TSHIRT-01-L', size: 'L', color: 'Black', price: 600, stock: 35 },
          { sku: 'ACME-TSHIRT-01-XL', size: 'XL', color: 'Black', price: 600, stock: 20 },
        ],
      },
      {
        title: 'Acme Hoodie Pullover',
        name: 'Acme Hoodie Pullover',
        sku: 'ACME-HOODIE-02',
        handle: 'acme-hoodie-pullover',
        slug: 'acme-hoodie-pullover',
        description: 'Sudadera con capucha gruesa de 400 GSM. Interior cepillado de máxima calidez con logotipo sutil de ACME en serigrafía de alta densidad.',
        price: 600,
        basePrice: 600,
        category: 'Apparel',
        image_url: 'https://cdn.shopify.com/s/files/1/0752/7691/9077/files/hoodie-1.png',
        images: ['https://cdn.shopify.com/s/files/1/0752/7691/9077/files/hoodie-1.png'],
        stock: true,
        storeId: acmeStore._id,
        variants: [
          { sku: 'ACME-HOODIE-02-M', size: 'M', color: 'Dark Grey', price: 600, stock: 30 },
          { sku: 'ACME-HOODIE-02-L', size: 'L', color: 'Dark Grey', price: 600, stock: 40 },
          { sku: 'ACME-HOODIE-02-XL', size: 'XL', color: 'Dark Grey', price: 600, stock: 25 },
        ],
      },
      {
        title: 'Acme Drawstring Backpack',
        name: 'Acme Drawstring Backpack',
        sku: 'ACME-BAG-03',
        handle: 'acme-drawstring-backpack',
        slug: 'acme-drawstring-backpack',
        description: 'Mochila estilo costal de nylon balístico resistente al agua. Compartimento frontal con zipper oculto y cordones de ajuste reforzados.',
        price: 600,
        basePrice: 600,
        category: 'Bags',
        image_url: 'https://cdn.shopify.com/s/files/1/0752/7691/9077/files/bag-1-dark.png',
        images: ['https://cdn.shopify.com/s/files/1/0752/7691/9077/files/bag-1-dark.png'],
        stock: true,
        storeId: acmeStore._id,
        variants: [
          { sku: 'ACME-BAG-03-UNI', size: 'Única', color: 'Stealth Black', price: 600, stock: 50 },
        ],
      },
      {
        title: 'Acme Ceramic Mug 12oz',
        name: 'Acme Ceramic Mug 12oz',
        sku: 'ACME-MUG-04',
        handle: 'acme-ceramic-mug-12oz',
        slug: 'acme-ceramic-mug-12oz',
        description: 'Taza de cerámica artesanal con acabado mate anti-reflejante. Apta para microondas y lavavajillas con capacidad para 350ml de café de especialidad.',
        price: 600,
        basePrice: 600,
        category: 'Drinkware',
        image_url: 'https://cdn.shopify.com/s/files/1/0752/7691/9077/files/cup-black.png',
        images: ['https://cdn.shopify.com/s/files/1/0752/7691/9077/files/cup-black.png'],
        stock: true,
        storeId: acmeStore._id,
        variants: [
          { sku: 'ACME-MUG-04-12', size: '12 oz', color: 'Matte Black', price: 600, stock: 60 },
          { sku: 'ACME-MUG-04-16', size: '16 oz', color: 'Matte Black', price: 600, stock: 45 },
        ],
      },
      {
        title: 'Acme Classic Cap',
        name: 'Acme Classic Cap',
        sku: 'ACME-CAP-05',
        handle: 'acme-classic-cap',
        slug: 'acme-classic-cap',
        description: 'Gorra estilo Dad Hat de 6 paneles en sarga de algodón peinado. Visera precurvada y broche metálico grabado.',
        price: 600,
        basePrice: 600,
        category: 'Headwear',
        image_url: 'https://cdn.shopify.com/s/files/1/0752/7691/9077/files/hat-1.png',
        images: ['https://cdn.shopify.com/s/files/1/0752/7691/9077/files/hat-1.png'],
        stock: true,
        storeId: acmeStore._id,
        variants: [
          { sku: 'ACME-CAP-05-UNI', size: 'Ajustable', color: 'Black', price: 600, stock: 40 },
        ],
      },
      {
        title: 'Acme Holographic Sticker Pack',
        name: 'Acme Holographic Sticker Pack',
        sku: 'ACME-STICK-06',
        handle: 'acme-holographic-sticker-pack',
        slug: 'acme-holographic-sticker-pack',
        description: 'Colección de 8 pegatinas de vinilo holográfico de alta durabilidad resistente a rayos UV e intemperie para laptops y botellas.',
        price: 600,
        basePrice: 600,
        category: 'Accessories',
        image_url: 'https://cdn.shopify.com/s/files/1/0752/7691/9077/files/stickers-1.png',
        images: ['https://cdn.shopify.com/s/files/1/0752/7691/9077/files/stickers-1.png'],
        stock: true,
        storeId: acmeStore._id,
        variants: [
          { sku: 'ACME-STICK-06-PACK', size: 'Pack x8', color: 'Multicolor', price: 600, stock: 100 },
        ],
      },
    ];

    // 6. Aprovisionar Base de Datos Dedicada en Atlas (tenant_acme_store)
    console.log(`\n🌱 Aprovisionando Base de Datos Dedicada 'tenant_acme_store' en MongoDB Atlas...`);
    const dbResult = await seedTenantDatabase(ACME_SLUG, {
      categories: acmeCategories,
      products: acmeProducts,
    });
    console.log(`✅ Base de Datos 'tenant_acme_store' creada con ${dbResult.categoriesCount} categorías y ${dbResult.productsCount} productos.`);

    // 7. Replicar en la Colección Maestra (LBM.products)
    for (const prod of acmeProducts) {
      const existing = await Product.findOne({ storeId: acmeStore._id, sku: prod.sku });
      if (!existing) {
        await Product.create(prod);
      }
    }
    console.log(`✅ Productos replicados en LBM.products con storeId: ${acmeStore._id}`);

    // 8. Crear Cliente y Pedido Demo en la BD de ACME
    const TenantClient = getTenantModel(ACME_SLUG, 'Client');
    const TenantOrder = getTenantModel(ACME_SLUG, 'Order');

    let demoClient = await TenantClient.findOne({ email: 'roberto@acme.mx' });
    if (!demoClient) {
      demoClient = await TenantClient.create({
        firstName: 'Roberto',
        lastName: 'Gómez',
        email: 'roberto@acme.mx',
        phone: '523119887766',
        password: 'PasswordClient2026!',
      });
    }

    await TenantOrder.deleteMany({});
    await TenantOrder.create({
      client: demoClient._id,
      orderItems: [
        {
          product: acmeProducts[0]._id || new mongoose.Types.ObjectId(),
          sku: 'ACME-TSHIRT-01-M',
          title: 'Acme Circles T-Shirt',
          quantity: 2,
          image_url: 'https://cdn.shopify.com/s/files/1/0752/7691/9077/files/t-shirt-1.png',
          price: 500, // 2 x $1000 MXN
          size: 'M',
        },
      ],
      shippingAddress: {
        address: 'Paseo de la Reforma #222, Piso 8',
        city: 'Ciudad de México',
        postalCode: '06600',
        country: 'México',
        state: 'CDMX',
      },
      itemsPrice: 1000,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 1000,
      isPaid: true,
      paidAt: new Date(),
      isDelivered: true,
      deliveredAt: new Date(),
    });
    console.log(`✅ Pedido demo registrado en 'tenant_acme_store.orders' ($1,000 MXN con promoción 2x1000).`);

    console.log('\n======================================================');
    console.log('🎉 TIENDA ACME (VERCEL COMMERCE) SEEDEADA CON ÉXITO');
    console.log('======================================================');
    console.log(`• Nombre: ACME Store México`);
    console.log(`• Slug: ${ACME_SLUG}`);
    console.log(`• Base de Datos en Atlas: tenant_acme_store`);
    console.log(`• Credenciales del Store Admin:`);
    console.log(`  - Usuario: acme_admin`);
    console.log(`  - Contraseña: AcmePassword2026!`);
    console.log(`  - Rol: store_admin`);
    console.log(`• Productos: 6 productos oficiales de Vercel Store con imágenes CDN`);
    console.log(`• Categorías: 5 categorías oficiales`);
    console.log(`• Pedidos: 1 pedido completado con promoción 2x1000`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Error al seedear tienda ACME:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB Atlas cerrada.');
    process.exit(0);
  }
};

seedAcmeStore();
