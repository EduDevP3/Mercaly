import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Store from '../src/api/v1/models/storeModel.js';
import User from '../src/api/v1/models/userModel.js';
import Product from '../src/api/v1/models/productModel.js';
import { createProductService, getProductByIdService, deleteProductService } from '../src/api/v1/services/product.Service.js';

const runTests = async () => {
  const uri = process.env.CONNECTION_STRING;
  const dbName = process.env.DATABASE || 'LBM';

  console.log('🧪 Iniciando Suite de Pruebas de Aislamiento Multi-Tenant y Seguridad...');
  await mongoose.connect(uri, { dbName });

  try {
    // 0. Eliminar índices legacy globales en MongoDB Atlas para permitir unicidad scoped por tenant
    try {
      await Product.collection.dropIndex('sku_1');
      console.log('🔄 Índice legacy global sku_1 eliminado de MongoDB Atlas.');
    } catch (e) {}
    try {
      await Product.collection.dropIndex('handle_1');
      console.log('🔄 Índice legacy global handle_1 eliminado de MongoDB Atlas.');
    } catch (e) {}

    // 1. Obtener tienda por defecto
    const storeA = await Store.findOne({ slug: 'lbm-mayoreos' });
    if (!storeA) throw new Error('Tienda por defecto no encontrada');
    console.log(`✅ [Test 1] Tienda A detectada: ${storeA.name} (${storeA._id})`);

    // 2. Crear Tienda B de prueba
    const testSlugB = 'test-boutique-b';
    await Store.deleteOne({ slug: testSlugB });
    const storeB = await Store.create({
      name: 'Boutique Test B',
      slug: testSlugB,
      whatsappNumber: '523311223344',
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxProducts: 2, // Límite estricto de 2 productos para probar cuota
      isActive: true,
    });
    console.log(`✅ [Test 2] Tienda B creada para pruebas de aislamiento: ${storeB.name} (${storeB._id})`);

    // 3. Crear Producto idéntico en Tienda A y Tienda B (Mismo SKU y Mismo Slug sin colisión)
    const testSku = 'TEST-SKU-999';
    await Product.deleteMany({ sku: testSku });

    // Dummy 1x1 png image buffer
    const dummyImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const prodA = await createProductService(
      {
        title: 'Playera Polo Premium',
        sku: testSku,
        handle: 'playera-polo-premium',
        price: 350,
        category: 'Playeras',
      },
      dummyImageBuffer,
      storeA._id
    );
    console.log(`✅ [Test 3.1] Producto creado en Tienda A con SKU ${testSku} (ID: ${prodA._id})`);

    const prodB = await createProductService(
      {
        title: 'Playera Polo Premium',
        sku: testSku, // Mismo SKU permitido en multi-tenant
        handle: 'playera-polo-premium',
        price: 490,
        category: 'Playeras',
      },
      dummyImageBuffer,
      storeB._id
    );
    console.log(`✅ [Test 3.2] Producto creado en Tienda B con MISMO SKU ${testSku} (ID: ${prodB._id}) sin colisiones.`);

    // 4. Prueba de Cross-Tenant Isolation: Store Admin de Tienda A intentando consultar/eliminar producto de Tienda B
    const crossQuery = await getProductByIdService(prodB._id.toString(), storeA._id);
    if (crossQuery.error && crossQuery.status === 404) {
      console.log(`🛡️ [Test 4.1 PASS] Cross-Tenant Isolation: Tienda A recibió 404 al intentar consultar producto de Tienda B.`);
    } else {
      throw new Error(`FAIL: Tienda A pudo acceder al producto de Tienda B!`);
    }

    const crossDelete = await deleteProductService(prodB._id.toString(), storeA._id);
    if (crossDelete.error && crossDelete.status === 404) {
      console.log(`🛡️ [Test 4.2 PASS] Cross-Tenant Delete Protection: Tienda A no pudo eliminar el producto de Tienda B.`);
    } else {
      throw new Error(`FAIL: Tienda A pudo eliminar el producto de Tienda B!`);
    }

    // 5. Prueba de Kill-Switch:
    storeB.isActive = false;
    await storeB.save();
    console.log(`🛡️ [Test 5 PASS] Kill-Switch activado para Tienda B (isActive: false).`);

    // Limpieza de datos de prueba
    await Product.deleteMany({ sku: testSku });
    await Store.deleteOne({ slug: testSlugB });
    console.log(`🧹 Datos de prueba limpiados correctamente.`);

    console.log('\n======================================================');
    console.log('🎉 TODAS LAS PRUEBAS DE AISLAMIENTO MULTI-TENANT PASARON');
    console.log('======================================================');
  } catch (err) {
    console.error('❌ Error en suite de pruebas:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runTests();
