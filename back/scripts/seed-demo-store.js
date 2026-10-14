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

const seedDemoStore = async () => {
  const uri = process.env.CONNECTION_STRING;
  const masterDbName = process.env.DATABASE || 'LBM';

  console.log('🚀 Iniciando Creación y Seeding Completo de la TIENDA DEMO en MongoDB Atlas...');
  await mongoose.connect(uri, { dbName: masterDbName });
  console.log(`✅ Conectado a MongoDB Atlas (Base Maestra: ${masterDbName})`);

  try {
    const DEMO_SLUG = 'demo-store';

    // 1. Limpiar datos previos de la demo si existieran
    await Store.deleteOne({ slug: DEMO_SLUG });
    await User.deleteOne({ nombre: 'demo_admin' });
    console.log(`🧹 Datos antiguos de '${DEMO_SLUG}' limpiados en base maestra.`);

    // 2. Crear Store en la Base Maestra (LBM.stores)
    const demoStore = await Store.create({
      name: 'Boutique Urbana Demo',
      slug: DEMO_SLUG,
      description: 'Tienda demo interactiva para presentación comercial y catálogo WhatsApp',
      whatsappNumber: '523221045519',
      logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#7c3aed',
      currency: 'MXN',
      isActive: true,
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 días
      maxProducts: 100,
      billingNotes: 'Tienda de demostración para presentaciones comerciales',
    });
    console.log(`✅ Tienda Demo registrada en LBM.stores con ID: ${demoStore._id}`);

    // 3. Crear Usuario store_admin para la demo
    const demoAdmin = await User.create({
      nombre: 'demo_admin',
      email: 'demo@tiendademo.com',
      contraseña: 'DemoPassword2026!',
      role: 'store_admin',
      storeId: demoStore._id,
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=DemoExecutive&backgroundColor=b6e3f4,c0aede',
      phone: '523221045519',
      bio: 'Administrador oficial de Boutique Urbana Demo',
    });
    console.log(`✅ Usuario demo_admin creado con contraseña: DemoPassword2026!`);

    // 4. Datos completos de la Tienda Demo
    const demoCategories = [
      { name: 'Playeras & Polos', handle: 'playeras-polos', description: 'Playeras piqué y algodón peinado' },
      { name: 'Sudaderas & Hoodies', handle: 'sudaderas-hoodies', description: 'Sudaderas térmicas con felpa pesada' },
      { name: 'Pantalones Cargo', handle: 'pantalones-cargo', description: 'Pantalones tácticos casuales' },
      { name: 'Calzado & Sneakers', handle: 'calzado-sneakers', description: 'Tenis urbanos de alta rotación' },
      { name: 'Accesorios & Gorras', handle: 'accesorios-gorras', description: 'Gorras snapback y cinturones' },
    ];

    const demoProducts = [
      {
        title: 'Playera Heavyweight Acid Wash',
        name: 'Playera Heavyweight Acid Wash',
        sku: 'DEMO-TOP-01',
        handle: 'playera-heavyweight-acid-wash',
        slug: 'playera-heavyweight-acid-wash',
        description: 'Playera de corte oversize con lavado vintage en ácido, 240 GSM 100% algodón.',
        price: 600,
        basePrice: 600,
        category: 'Playeras & Polos',
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'],
        stock: true,
        storeId: demoStore._id,
        variants: [
          { sku: 'DEMO-TOP-01-M', size: 'M', color: 'Gris Deslavado', price: 600, stock: 25 },
          { sku: 'DEMO-TOP-01-G', size: 'G', color: 'Gris Deslavado', price: 600, stock: 30 },
          { sku: 'DEMO-TOP-01-XL', size: 'XL', color: 'Gris Deslavado', price: 600, stock: 15 },
        ],
      },
      {
        title: 'Sudadera Hoodie French Terry Premium',
        name: 'Sudadera Hoodie French Terry Premium',
        sku: 'DEMO-HOOD-02',
        handle: 'sudadera-hoodie-french-terry-premium',
        slug: 'sudadera-hoodie-french-terry-premium',
        description: 'Sudadera con capucha y bolsa canguro. Máxima calidez y comodidad para mayoreo.',
        price: 600,
        basePrice: 600,
        category: 'Sudaderas & Hoodies',
        image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'],
        stock: true,
        storeId: demoStore._id,
        variants: [
          { sku: 'DEMO-HOOD-02-CH', size: 'CH', color: 'Negro Mate', price: 600, stock: 20 },
          { sku: 'DEMO-HOOD-02-M', size: 'M', color: 'Negro Mate', price: 600, stock: 35 },
          { sku: 'DEMO-HOOD-02-G', size: 'G', color: 'Negro Mate', price: 600, stock: 40 },
        ],
      },
      {
        title: 'Pantalón Cargo Táctico Street',
        name: 'Pantalón Cargo Táctico Street',
        sku: 'DEMO-PANT-03',
        handle: 'pantalon-cargo-tactico-street',
        slug: 'pantalon-cargo-tactico-street',
        description: 'Pantalón con 6 bolsas funcionales, jareta ajustable en tobillos y tela ripstop.',
        price: 600,
        basePrice: 600,
        category: 'Pantalones Cargo',
        image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80'],
        stock: true,
        storeId: demoStore._id,
        variants: [
          { sku: 'DEMO-PANT-03-30', size: '30', color: 'Verde Militar', price: 600, stock: 15 },
          { sku: 'DEMO-PANT-03-32', size: '32', color: 'Verde Militar', price: 600, stock: 25 },
          { sku: 'DEMO-PANT-03-34', size: '34', color: 'Verde Militar', price: 600, stock: 20 },
        ],
      },
      {
        title: 'Sneakers Retro Low Vintage Court',
        name: 'Sneakers Retro Low Vintage Court',
        sku: 'DEMO-SNK-04',
        handle: 'sneakers-retro-low-vintage-court',
        slug: 'sneakers-retro-low-vintage-court',
        description: 'Tenis de corte bajo inspirados en el basketball clásico de los 80s con suela cosida.',
        price: 600,
        basePrice: 600,
        category: 'Calzado & Sneakers',
        image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80'],
        stock: true,
        storeId: demoStore._id,
        variants: [
          { sku: 'DEMO-SNK-04-26', size: '26 MX', color: 'Blanco/Azul', price: 600, stock: 10 },
          { sku: 'DEMO-SNK-04-27', size: '27 MX', color: 'Blanco/Azul', price: 600, stock: 18 },
          { sku: 'DEMO-SNK-04-28', size: '28 MX', color: 'Blanco/Azul', price: 600, stock: 12 },
        ],
      },
      {
        title: 'Gorra Snapback Bordado 3D Street',
        name: 'Gorra Snapback Bordado 3D Street',
        sku: 'DEMO-CAP-05',
        handle: 'gorra-snapback-bordado-3d-street',
        slug: 'gorra-snapback-bordado-3d-street',
        description: 'Gorra de corona alta con bordado tridimensional y broche ajustable posterior.',
        price: 600,
        basePrice: 600,
        category: 'Accesorios & Gorras',
        image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80'],
        stock: true,
        storeId: demoStore._id,
        variants: [
          { sku: 'DEMO-CAP-05-UNI', size: 'Ajustable', color: 'Negro/Rojo', price: 600, stock: 50 },
        ],
      },
      {
        title: 'Chamarra Cortavientos Reflectiva Windbreaker',
        name: 'Chamarra Cortavientos Reflectiva Windbreaker',
        sku: 'DEMO-JACK-06',
        handle: 'chamarra-cortavientos-reflectiva-windbreaker',
        slug: 'chamarra-cortavientos-reflectiva-windbreaker',
        description: 'Chamarra ultra ligera resistente al agua con detalles reflectivos para noche.',
        price: 600,
        basePrice: 600,
        category: 'Sudaderas & Hoodies',
        image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80'],
        stock: true,
        storeId: demoStore._id,
        variants: [
          { sku: 'DEMO-JACK-06-M', size: 'M', color: 'Plata Reflectivo', price: 600, stock: 20 },
          { sku: 'DEMO-JACK-06-G', size: 'G', color: 'Plata Reflectivo', price: 600, stock: 25 },
        ],
      },
    ];

    // 5. Sembrar en la Base de Datos Dedicada en Atlas (tenant_demo_store)
    console.log(`\n🌱 Creando Base de Datos Dedicada 'tenant_demo_store' en MongoDB Atlas...`);
    const dbResult = await seedTenantDatabase(DEMO_SLUG, {
      categories: demoCategories,
      products: demoProducts,
    });
    console.log(`✅ Base de Datos 'tenant_demo_store' creada con ${dbResult.categoriesCount} categorías y ${dbResult.productsCount} productos.`);

    // 6. Sembrar también en la Base Maestra para compatibilidad universal
    for (const prod of demoProducts) {
      const existing = await Product.findOne({ storeId: demoStore._id, sku: prod.sku });
      if (!existing) {
        await Product.create(prod);
      }
    }
    console.log(`✅ Productos replicados en la colección maestra para consultas cruzadas.`);

    // 7. Sembrar Pedidos de muestra en la base de datos de la demo
    const TenantOrder = getTenantModel(DEMO_SLUG, 'Order');
    await TenantOrder.deleteMany({});

    const sampleOrders = [
      {
        orderId: 'ORD-DEMO-9821',
        customer: {
          name: 'Carlos Ramírez Gómez',
          phone: '523112233445',
          email: 'carlos@ejemplo.com',
          address: 'Av. Insurgentes #450, Col. Centro, Tepic, Nayarit',
        },
        items: [
          {
            productId: demoProducts[0]._id || new mongoose.Types.ObjectId(),
            name: 'Playera Heavyweight Acid Wash',
            sku: 'DEMO-TOP-01-M',
            size: 'M',
            color: 'Gris Deslavado',
            quantity: 2,
            unitPrice: 500, // Promoción 2x1000
          },
        ],
        subtotal: 1000,
        total: 1000,
        status: 'Delivered',
        paymentStatus: 'Paid',
        notes: 'Cliente frecuente, entrega por la mañana',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        orderId: 'ORD-DEMO-9822',
        customer: {
          name: 'Mariana Torres Vega',
          phone: '523319887766',
          email: 'mariana@ejemplo.com',
          address: 'Calle Hidalgo #120, Col. San Juan, Guadalajara, Jalisco',
        },
        items: [
          {
            productId: demoProducts[1]._id || new mongoose.Types.ObjectId(),
            name: 'Sudadera Hoodie French Terry Premium',
            sku: 'DEMO-HOOD-02-G',
            size: 'G',
            color: 'Negro Mate',
            quantity: 2,
            unitPrice: 500, // 1 par = $1000
          },
          {
            productId: demoProducts[2]._id || new mongoose.Types.ObjectId(),
            name: 'Pantalón Cargo Táctico Street',
            sku: 'DEMO-PANT-03-32',
            size: '32',
            color: 'Verde Militar',
            quantity: 1,
            unitPrice: 600, // 1 suelto = $600
          },
        ],
        subtotal: 1600,
        total: 1600, // Total 2x1000 + 1x600 = $1,600 MXN
        status: 'Processing',
        paymentStatus: 'Pending',
        notes: 'Confirmado por WhatsApp, pendiente comprobante',
        createdAt: new Date(),
      },
    ];

    for (const ord of sampleOrders) {
      await TenantOrder.create(ord);
    }
    console.log(`✅ 2 Pedidos demo creados en 'tenant_demo_store.orders' (uno entregado y uno en proceso con regla 2x1000).`);

    console.log('\n======================================================');
    console.log('🎉 TIENDA DEMO SEEDEADA CON ÉXITO EN MONGODB ATLAS');
    console.log('======================================================');
    console.log(`• Tienda: Boutique Urbana Demo`);
    console.log(`• Slug: ${DEMO_SLUG}`);
    console.log(`• Base de Datos en Atlas: tenant_demo_store`);
    console.log(`• Credenciales de Acceso:`);
    console.log(`  - Usuario: demo_admin`);
    console.log(`  - Contraseña: DemoPassword2026!`);
    console.log(`  - Rol: store_admin`);
    console.log(`• Productos: 6 prendas con variantes de talla y fotos HD`);
    console.log(`• Categorías: 5 categorías`);
    console.log(`• Pedidos: 2 pedidos (Demostrando la regla 2x1000)`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Error al seedear tienda demo:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB Atlas cerrada.');
    process.exit(0);
  }
};

seedDemoStore();
