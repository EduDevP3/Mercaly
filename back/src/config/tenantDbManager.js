import mongoose from 'mongoose';
import config from './config.js';
import Product from '../api/v1/models/productModel.js';
import Category from '../api/v1/models/categoryModel.js';
import { Order } from '../api/v1/models/orderModel.js';
import { Client } from '../api/v1/models/clientModel.js';

// Mapa en memoria para almacenar instancias cacheadas de modelos por base de datos
const tenantModelsCache = new Map();

/**
 * Normaliza el nombre de la base de datos para MongoDB Atlas
 * @param {string} slug Slug del tenant (ej: 'boutique-roma')
 * @returns {string} Nombre de la base de datos (ej: 'tenant_boutique_roma')
 */
export const getTenantDbName = (slug) => {
  const cleanSlug = String(slug || 'default')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_');
  return `tenant_${cleanSlug}`;
};

/**
 * Obtiene la conexión a la base de datos específica de un Tenant en MongoDB Atlas
 * Utiliza connection.useDb() para compartir el pool de conexiones existente sin sobrecargar Atlas
 * @param {string} slug Slug de la tienda
 * @returns {mongoose.Connection} Conexión de la base de datos del tenant
 */
export const getTenantDbConnection = (slug) => {
  const dbName = getTenantDbName(slug);
  // useCache: true permite a Mongoose reutilizar la instancia interna de la base de datos
  return mongoose.connection.useDb(dbName, { useCache: true });
};

/**
 * Obtiene un modelo de Mongoose atado a la base de datos física del Tenant
 * @param {string} slug Slug de la tienda
 * @param {string} modelName Nombre del modelo ('Product', 'Category', 'Order', 'Client')
 * @returns {mongoose.Model}
 */
export const getTenantModel = (slug, modelName) => {
  const dbName = getTenantDbName(slug);
  const cacheKey = `${dbName}:${modelName}`;

  if (tenantModelsCache.has(cacheKey)) {
    return tenantModelsCache.get(cacheKey);
  }

  const tenantDb = getTenantDbConnection(slug);
  let modelInstance;

  switch (modelName) {
    case 'Product':
      modelInstance = tenantDb.model('Product', Product.schema);
      break;
    case 'Category':
      modelInstance = tenantDb.model('Category', Category.schema);
      break;
    case 'Order':
      modelInstance = tenantDb.model('Order', Order.schema);
      break;
    case 'Client':
      modelInstance = tenantDb.model('Client', Client.schema);
      break;
    default:
      throw new Error(`Modelo no reconocido para tenant: ${modelName}`);
  }

  tenantModelsCache.set(cacheKey, modelInstance);
  return modelInstance;
};

/**
 * Lista todas las bases de datos registradas en el clúster de MongoDB Atlas
 * junto con sus colecciones y conteos de documentos
 */
export const getAtlasDatabasesOverview = async () => {
  const adminDb = mongoose.connection.db.admin();
  const dbsInfo = await adminDb.listDatabases();
  const tenantDbs = [];

  for (const db of dbsInfo.databases) {
    // Incluir bases de datos maestras y bases de datos tenant_*
    const masterDbName = config.DATABASE || 'mercaly';
    if (db.name.startsWith('tenant_') || db.name === masterDbName) {
      const dbConn = mongoose.connection.useDb(db.name, { useCache: true });
      const collections = await dbConn.db.listCollections().toArray();

      const collectionsSummary = await Promise.all(
        collections.map(async (col) => {
          const count = await dbConn.collection(col.name).countDocuments();
          return {
            name: col.name,
            documentCount: count,
          };
        })
      );

      tenantDbs.push({
        dbName: db.name,
        sizeOnDisk: db.sizeOnDisk,
        empty: db.empty,
        collectionsCount: collections.length,
        collections: collectionsSummary,
      });
    }
  }

  return {
    totalDatabases: tenantDbs.length,
    databases: tenantDbs,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Aprovisiona y siembra datos iniciales en la base de datos de un tenant en MongoDB Atlas
 * @param {string} slug Slug de la tienda
 * @param {Object} seedData Categorías y productos a sembrar
 */
export const seedTenantDatabase = async (slug, seedData = {}) => {
  const dbName = getTenantDbName(slug);
  console.log(`🌱 Aprovisionando base de datos en MongoDB Atlas: '${dbName}'...`);

  const tenantDb = getTenantDbConnection(slug);

  // 1. Asegurar la creación física de colecciones en MongoDB Atlas
  try {
    const existingCollections = (await tenantDb.db.listCollections().toArray()).map((c) => c.name);
    const requiredCollections = ['categories', 'products', 'orders', 'clients'];
    for (const colName of requiredCollections) {
      if (!existingCollections.includes(colName)) {
        await tenantDb.db.createCollection(colName);
        console.log(`📁 Colección '${colName}' creada en Atlas DB '${dbName}'`);
      }
    }
  } catch (colErr) {
    console.warn(`Aviso asegurando colecciones en '${dbName}':`, colErr.message);
  }

  const TenantProduct = getTenantModel(slug, 'Product');
  const TenantCategory = getTenantModel(slug, 'Category');

  // 2. Sembrar Categorías si vienen provistas
  const createdCategories = [];
  if (seedData.categories && seedData.categories.length > 0) {
    for (const cat of seedData.categories) {
      const existing = await TenantCategory.findOne({ handle: cat.handle });
      if (!existing) {
        const newCat = await TenantCategory.create({
          ...cat,
          storeId: cat.storeId || seedData.storeId || new mongoose.Types.ObjectId(),
        });
        createdCategories.push(newCat);
      } else {
        createdCategories.push(existing);
      }
    }
    console.log(`✅ ${createdCategories.length} categorías creadas en '${dbName}.categories'`);
  }

  // 3. Sembrar Productos si vienen provistos
  const createdProducts = [];
  if (seedData.products && seedData.products.length > 0) {
    const effectiveStoreId = seedData.storeId || new mongoose.Types.ObjectId();
    for (const prod of seedData.products) {
      const existing = await TenantProduct.findOne({ sku: prod.sku });
      if (!existing) {
        const newProd = await TenantProduct.create({
          ...prod,
          storeId: prod.storeId || effectiveStoreId,
        });
        createdProducts.push(newProd);
      } else {
        createdProducts.push(existing);
      }
    }
    console.log(`✅ ${createdProducts.length} productos creados en '${dbName}.products'`);
  }

  return {
    database: dbName,
    categoriesCount: createdCategories.length,
    productsCount: createdProducts.length,
  };
};

export default {
  getTenantDbName,
  getTenantDbConnection,
  getTenantModel,
  getAtlasDatabasesOverview,
  seedTenantDatabase,
};
