import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import {
  getTenantDbConnection,
  getTenantModel,
  getAtlasDatabasesOverview,
  seedTenantDatabase,
} from '../src/config/tenantDbManager.js';

const runAtlasSetup = async () => {
  const uri = process.env.CONNECTION_STRING;
  const masterDbName = process.env.DATABASE || 'LBM';

  console.log('🚀 Iniciando Configuración y Aprovisionamiento Multi-Database en MongoDB Atlas...');
  await mongoose.connect(uri, { dbName: masterDbName });
  console.log(`✅ Conectado a MongoDB Atlas (Base Maestra: ${masterDbName})`);

  try {
    // -------------------------------------------------------------
    // TENANT 1: La Barata Mayoreos (LBM) -> DB: tenant_lbm_mayoreos
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('📦 Aprovisionando Tenant 1: La Barata Mayoreos (tenant_lbm_mayoreos)');
    console.log('======================================================');

    await seedTenantDatabase('lbm-mayoreos', {
      categories: [
        { name: 'Playeras Polo', handle: 'playeras-polo', description: 'Playeras tipo polo piqué 100% algodón' },
        { name: 'Sudaderas Oversize', handle: 'sudaderas-oversize', description: 'Sudaderas con felpa premium' },
        { name: 'Pantalones Cargo', handle: 'pantalones-cargo', description: 'Pantalones tácticos y casuales de mayoreo' },
        { name: 'Calzado Deportivo', handle: 'calzado-deportivo', description: 'Tenis urbanos de alta rotación' },
      ],
      products: [
        {
          title: 'Playera Polo Piqué Lisa',
          name: 'Playera Polo Piqué Lisa',
          sku: 'LBM-POLO-01',
          handle: 'playera-polo-pique-lisa',
          slug: 'playera-polo-pique-lisa',
          price: 500,
          basePrice: 500,
          category: 'Playeras Polo',
          image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
          images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80'],
          stock: true,
          variants: [
            { sku: 'LBM-POLO-01-CH', size: 'CH', color: 'Negro', price: 500, stock: 40 },
            { sku: 'LBM-POLO-01-M', size: 'M', color: 'Negro', price: 500, stock: 60 },
            { sku: 'LBM-POLO-01-G', size: 'G', color: 'Negro', price: 500, stock: 50 },
          ],
        },
        {
          title: 'Sudadera Hoodie Térmica Canguro',
          name: 'Sudadera Hoodie Térmica Canguro',
          sku: 'LBM-HOOD-02',
          handle: 'sudadera-hoodie-termica-canguro',
          slug: 'sudadera-hoodie-termica-canguro',
          price: 600,
          basePrice: 600,
          category: 'Sudaderas Oversize',
          image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
          images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'],
          stock: true,
          variants: [
            { sku: 'LBM-HOOD-02-M', size: 'M', color: 'Gris Oxford', price: 600, stock: 35 },
            { sku: 'LBM-HOOD-02-G', size: 'G', color: 'Gris Oxford', price: 600, stock: 45 },
          ],
        },
      ],
    });

    // -------------------------------------------------------------
    // TENANT 2: Boutique Roma -> DB: tenant_boutique_roma
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('👗 Aprovisionando Tenant 2: Boutique Roma (tenant_boutique_roma)');
    console.log('======================================================');

    await seedTenantDatabase('boutique-roma', {
      categories: [
        { name: 'Vestidos de Noche', handle: 'vestidos-noche', description: 'Vestidos de fiesta y coctel de diseñador' },
        { name: 'Bolsos de Mano', handle: 'bolsos-mano', description: 'Bolsos en piel sintética italiana' },
        { name: 'Joyería Fina', handle: 'joyeria-fina', description: 'Aretes, collares y pulseras en chapa de oro' },
      ],
      products: [
        {
          title: 'Vestido Satinado Corte Sirena',
          name: 'Vestido Satinado Corte Sirena',
          sku: 'ROMA-VEST-01',
          handle: 'vestido-satinado-corte-sirena',
          slug: 'vestido-satinado-corte-sirena',
          price: 1850,
          basePrice: 1850,
          category: 'Vestidos de Noche',
          image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
          images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80'],
          stock: true,
          variants: [
            { sku: 'ROMA-VEST-01-S', size: 'S', color: 'Esmeralda', price: 1850, stock: 10 },
            { sku: 'ROMA-VEST-01-M', size: 'M', color: 'Esmeralda', price: 1850, stock: 15 },
          ],
        },
        {
          title: 'Bolso Tote Clásico Monograma',
          name: 'Bolso Tote Clásico Monograma',
          sku: 'ROMA-BAG-02',
          handle: 'bolso-tote-clasico-monograma',
          slug: 'bolso-tote-clasico-monograma',
          price: 1200,
          basePrice: 1200,
          category: 'Bolsos de Mano',
          image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
          images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'],
          stock: true,
          variants: [
            { sku: 'ROMA-BAG-02-UNI', size: 'Única', color: 'Café Caramelo', price: 1200, stock: 20 },
          ],
        },
      ],
    });

    // -------------------------------------------------------------
    // TENANT 3: Urban Style -> DB: tenant_urban_style
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('👟 Aprovisionando Tenant 3: Urban Style (tenant_urban_style)');
    console.log('======================================================');

    await seedTenantDatabase('urban-style', {
      categories: [
        { name: 'Sneakers Retro', handle: 'sneakers-retro', description: 'Calzado urbano vintage y de colección' },
        { name: 'Gorras Snapback', handle: 'gorras-snapback', description: 'Gorras planas bordadas de alta calidad' },
      ],
      products: [
        {
          title: 'Sneakers High Top Street 90s',
          name: 'Sneakers High Top Street 90s',
          sku: 'URBAN-SNK-01',
          handle: 'sneakers-high-top-street-90s',
          slug: 'sneakers-high-top-street-90s',
          price: 2400,
          basePrice: 2400,
          category: 'Sneakers Retro',
          image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
          images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80'],
          stock: true,
          variants: [
            { sku: 'URBAN-SNK-01-26', size: '26 MX', color: 'Blanco/Rojo', price: 2400, stock: 8 },
            { sku: 'URBAN-SNK-01-27', size: '27 MX', color: 'Blanco/Rojo', price: 2400, stock: 12 },
            { sku: 'URBAN-SNK-01-28', size: '28 MX', color: 'Blanco/Rojo', price: 2400, stock: 10 },
          ],
        },
      ],
    });

    // -------------------------------------------------------------
    // AUDITORÍA Y RESUMEN GENERAL EN MONGODB ATLAS
    // -------------------------------------------------------------
    console.log('\n======================================================');
    console.log('📊 REPORTE DE BASES DE DATOS ACTIVAS EN MONGODB ATLAS');
    console.log('======================================================');

    const overview = await getAtlasDatabasesOverview();
    console.log(`Total de bases de datos de la plataforma en Atlas: ${overview.totalDatabases}`);
    console.table(
      overview.databases.map((d) => ({
        BaseDeDatos: d.dbName,
        Colecciones: d.collectionsCount,
        TamañoMB: (d.sizeOnDisk / (1024 * 1024)).toFixed(2) + ' MB',
      }))
    );

    console.log('\nDetalle de Colecciones por Base de Datos en Atlas:');
    overview.databases.forEach((d) => {
      console.log(`\n📁 [${d.dbName}]:`);
      d.collections.forEach((c) => {
        console.log(`   └─ 📂 ${c.name} (${c.documentCount} documentos)`);
      });
    });

    console.log('\n🎉 ¡CONFIGURACIÓN MULTI-DATABASE EN ATLAS COMPLETADA CON ÉXITO!');
  } catch (error) {
    console.error('❌ Error configurando multi-database en Atlas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB Atlas cerrada.');
    process.exit(0);
  }
};

runAtlasSetup();
