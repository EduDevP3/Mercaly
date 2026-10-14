import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde la raíz del backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Store from '../src/api/v1/models/storeModel.js';
import User from '../src/api/v1/models/userModel.js';
import Product from '../src/api/v1/models/productModel.js';

const runMigration = async () => {
  const uri = process.env.CONNECTION_STRING;
  const dbName = process.env.DATABASE || 'LBM';

  if (!uri) {
    console.error('❌ Error: CONNECTION_STRING no está definido en el archivo .env');
    process.exit(1);
  }

  console.log('🔄 Conectando a MongoDB Atlas para migración Multi-Tenant...');
  await mongoose.connect(uri, { dbName });
  console.log('✅ Conexión establecida con éxito.');

  try {
    // 1. Crear o recuperar la tienda inicial por defecto
    const DEFAULT_SLUG = 'lbm-mayoreos';
    let defaultStore = await Store.findOne({ slug: DEFAULT_SLUG });

    if (!defaultStore) {
      console.log(`📦 Creando tienda por defecto: '${DEFAULT_SLUG}'...`);
      defaultStore = await Store.create({
        name: 'La Barata Mayoreos (LBM)',
        slug: DEFAULT_SLUG,
        description: 'Catálogo oficial de mayoreo en México de LBM',
        whatsappNumber: '523221045519',
        primaryColor: '#111827',
        currency: 'MXN',
        isActive: true,
        subscriptionPlan: 'pro',
        subscriptionStatus: 'active',
        // 1 año de vigencia para la tienda maestra inicial
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        maxProducts: 500,
        billingNotes: 'Tenant inicial maestro de la plataforma',
      });
      console.log(`✅ Tienda creada con ID: ${defaultStore._id}`);
    } else {
      console.log(`ℹ️ Tienda por defecto ya existe con ID: ${defaultStore._id}`);
    }

    // 2. Asociar todos los productos huérfanos a la tienda por defecto
    const unassociatedProducts = await Product.find({
      $or: [
        { storeId: { $exists: false } },
        { storeId: null }
      ]
    });

    console.log(`🔍 Productos detectados sin tenant asignado: ${unassociatedProducts.length}`);

    if (unassociatedProducts.length > 0) {
      const updateResult = await Product.updateMany(
        {
          $or: [
            { storeId: { $exists: false } },
            { storeId: null }
          ]
        },
        {
          $set: {
            storeId: defaultStore._id,
            isPublished: true,
          }
        }
      );
      console.log(`✅ ${updateResult.modifiedCount} productos asignados al storeId ${defaultStore._id}`);
    }

    // Asegurar compatibilidad de campos en todos los productos
    const allProducts = await Product.find({ storeId: defaultStore._id });
    for (const p of allProducts) {
      let needsSave = false;
      if (!p.name && p.title) { p.name = p.title; needsSave = true; }
      if (!p.slug && p.handle) { p.slug = p.handle; needsSave = true; }
      if (p.basePrice === undefined && p.price !== undefined) { p.basePrice = p.price; needsSave = true; }
      if (p.image_url && (!p.images || p.images.length === 0)) { p.images = [p.image_url]; needsSave = true; }
      if (needsSave) {
        await p.save();
      }
    }
    console.log(`✅ Campos de compatibilidad (name, slug, basePrice, images) sincronizados.`);

    // 3. Crear o actualizar usuarios con roles RBAC y vincular a storeId
    const users = await User.find({});
    console.log(`👥 Usuarios existentes en el sistema: ${users.length}`);

    for (const user of users) {
      let modified = false;
      // Si el rol es admin legacy, actualizar a store_admin
      if (user.role === 'admin' || user.role === 'editor') {
        user.role = 'store_admin';
        modified = true;
      } else if (user.role === 'superadmin') {
        user.role = 'super_admin';
        modified = true;
      }

      // Si es store_admin y no tiene tienda asociada, asociar a la tienda default
      if (user.role === 'store_admin' && !user.storeId) {
        user.storeId = defaultStore._id;
        modified = true;
      }

      if (modified) {
        await user.save();
        console.log(`👤 Usuario '${user.nombre}' actualizado a rol '${user.role}' con storeId: ${user.storeId || 'null'}`);
      }
    }

    // 4. Asegurar la existencia de al menos un Super Admin
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (!superAdmin) {
      console.log('🛡️ Creando Super Admin inicial del sistema...');
      await User.create({
        nombre: 'superadmin',
        email: 'superadmin@lbm.com',
        contraseña: 'SuperAdminPassword2026!',
        role: 'super_admin',
        storeId: null,
        bio: 'Super Administrador de la plataforma Multi-Tenant',
      });
      console.log('✅ Super Admin creado: usuario: superadmin / pass: SuperAdminPassword2026!');
    } else {
      console.log(`ℹ️ Super Admin detectado: '${superAdmin.nombre}'`);
    }

    console.log('\n========================================');
    console.log('🎉 ¡MIGRACIÓN MULTI-TENANT COMPLETADA CON ÉXITO!');
    console.log('========================================');
  } catch (error) {
    console.error('❌ Error fatal durante la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB cerrada.');
    process.exit(0);
  }
};

runMigration();
