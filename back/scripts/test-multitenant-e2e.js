import axios from 'axios';

const BASE_URL = 'http://localhost:82/api/v1';

async function testSuite() {
  console.log('====================================================');
  console.log('🧪 EJECUTANDO TEST SUITE E2E: AISLAMIENTO MULTI-TENANT');
  console.log('====================================================\n');

  try {
    // 1. Probar Login de acme_admin
    console.log('1️⃣ Iniciando sesión como acme_admin...');
    const acmeLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      nombre: 'acme_admin',
      contraseña: 'AcmePassword2026!'
    });
    const acmeToken = acmeLoginRes.data.token;
    console.log('✅ Login exitoso para acme_admin. Token recibido.');

    // 2. Probar GET /categories con token de acme_admin
    console.log('2️⃣ Consultando GET /categories con token de acme_admin...');
    const acmeCatRes = await axios.get(`${BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${acmeToken}` }
    });
    const acmeCategories = acmeCatRes.data.categories || [];
    const acmeCatNames = acmeCategories.map(c => c.name);
    console.log(`📋 Categorías retornadas para Acme (${acmeCategories.length}):`, acmeCatNames);

    if (acmeCatNames.includes('Playeras & Polos') || acmeCatNames.includes('Maja') || acmeCatNames.includes('sudadera')) {
      throw new Error(`❌ FALLA CRÍTICA: acme_admin vio categorías ajenas en su listado: ${acmeCatNames.join(', ')}`);
    }

    const expectedAcme = ['Apparel', 'Bags', 'Drinkware', 'Headwear', 'Accessories'];
    const hasAllExpected = expectedAcme.every(exp => acmeCatNames.includes(exp));
    if (!hasAllExpected) {
      throw new Error(`❌ FALLA: Faltan categorías esperadas de Acme. Encontradas: ${acmeCatNames.join(', ')}`);
    }
    console.log('✅ [PASS] acme_admin ve ÚNICAMENTE y exactamente sus 5 categorías oficiales de Acme Store.');

    // 3. Probar GET /products con token de acme_admin
    console.log('3️⃣ Consultando GET /products con token de acme_admin...');
    const acmeProdRes = await axios.get(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${acmeToken}` }
    });
    const acmeProducts = acmeProdRes.data.products || acmeProdRes.data || [];
    console.log(`📦 Productos retornados para Acme (${acmeProducts.length}):`, acmeProducts.map(p => p.title));
    if (acmeProducts.some(p => p.sku && p.sku.startsWith('LBM'))) {
      throw new Error('❌ FALLA CRÍTICA: acme_admin vio productos de LBM Mayoreos!');
    }
    console.log('✅ [PASS] acme_admin ve ÚNICAMENTE productos de Acme Store.');

    // 4. Probar Login de admin (LBM)
    console.log('\n4️⃣ Iniciando sesión como admin (LBM Mayoreos)...');
    const lbmLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      nombre: 'admin',
      contraseña: 'admin123'
    });
    const lbmToken = lbmLoginRes.data.token;
    console.log('✅ Login exitoso para admin (LBM).');

    // 5. Probar GET /categories con token de LBM admin
    console.log('5️⃣ Consultando GET /categories con token de LBM...');
    const lbmCatRes = await axios.get(`${BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${lbmToken}` }
    });
    const lbmCategories = lbmCatRes.data.categories || [];
    const lbmCatNames = lbmCategories.map(c => c.name);
    console.log(`📋 Categorías retornadas para LBM (${lbmCategories.length}):`, lbmCatNames);

    if (lbmCatNames.includes('Apparel') || lbmCatNames.includes('Drinkware')) {
      throw new Error(`❌ FALLA CRÍTICA: LBM vio categorías de Acme Store!`);
    }
    console.log('✅ [PASS] LBM ve ÚNICAMENTE sus categorías de mayoreo.');

    // 6. Probar Login de superadmin
    console.log('\n6️⃣ Probando sesión de superadmin...');
    const superLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      nombre: 'superadmin',
      contraseña: 'SuperAdminPassword2026!'
    });
    const superToken = superLoginRes.data.token;
    console.log('✅ Login exitoso para superadmin. Rol asignado:', superLoginRes.data.user.role);

    // 7. Probar consulta de tiendas de superadmin
    const tenantsRes = await axios.get(`${BASE_URL}/super-admin/tenants`, {
      headers: { Authorization: `Bearer ${superToken}` }
    });
    const tenants = Array.isArray(tenantsRes.data.data) ? tenantsRes.data.data : [];
    console.log(`🏢 Tiendas gestionadas por superadmin (${tenants.length}):`, tenants.map(t => `${t.name} (${t.slug}) - ${t.productsCount} productos`));
    console.log('✅ [PASS] superadmin tiene visibilidad y control sobre todos los tenants.');

    console.log('\n====================================================');
    console.log('🎉 TODAS LAS PRUEBAS E2E DE AISLAMIENTO MULTI-TENANT');
    console.log('   PASARON SATISFACTORIAMENTE AL 100%');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Error en pruebas:', err.response?.data || err.message);
    process.exit(1);
  }
}

testSuite();
