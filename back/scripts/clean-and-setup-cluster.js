import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || (process.env.CONNECTION_STRING ? `${process.env.CONNECTION_STRING}${process.env.DATABASE || 'LBM'}` : null);

if (!MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI no está definido en el archivo .env');
  process.exit(1);
}

// Modelos esquemáticos mínimos
const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  plan: { type: String, enum: ['free', 'basic', 'pro', 'enterprise'], default: 'basic' },
  isActive: { type: Boolean, default: true },
  subscriptionStatus: { type: String, enum: ['active', 'past_due', 'canceled', 'suspended'], default: 'active' },
  subscriptionExpiresAt: { type: Date, required: true },
  maxProducts: { type: Number, default: 50 },
  contactWhatsApp: { type: String, default: '' },
  customDomain: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  databaseName: { type: String, default: '' },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superadmin', 'store_admin', 'super_admin', 'client'], default: 'admin' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', default: null },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  telefono: { type: String, default: '' },
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  handle: { type: String, required: true },
}, { timestamps: true });
categorySchema.index({ storeId: 1, handle: 1 }, { unique: true });
categorySchema.index({ storeId: 1, name: 1 }, { unique: true });

const slugify = (text) => {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const productSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: { type: String, trim: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, lowercase: true, trim: true },
  handle: { type: String, required: true, lowercase: true, trim: true },
  sku: { type: String, required: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  category: { type: String, required: true },
  image_url: { type: String, required: true },
  stock: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: true },
  variants: [{ size: String, stock: Number }],
}, { timestamps: true });
productSchema.index({ storeId: 1, sku: 1 }, { unique: true });
productSchema.index({ storeId: 1, slug: 1 }, { unique: true });

const orderSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  orderItems: Array,
  shippingAddress: Object,
  itemsPrice: Number,
  totalPrice: Number,
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

async function run() {
  console.log('================================================================');
  console.log('🚀 INICIANDO LIMPIEZA PROFUNDA Y CONFIGURACIÓN MULTI-TENANT ATLAS');
  console.log('================================================================');

  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectado a MongoDB Atlas:', mongoose.connection.name);

  const db = mongoose.connection.db;

  // 1. Auditar y limpiar colecciones/índices obsoletos
  const collections = await db.listCollections().toArray();
  const collNames = collections.map(c => c.name);
  console.log('📋 Colecciones encontradas en base principal:', collNames);

  // Dropear índices globales conflictivos si existen en categories
  if (collNames.includes('categories')) {
    try {
      const catIndexes = await db.collection('categories').indexes();
      for (const idx of catIndexes) {
        if (idx.name === 'name_1' || idx.name === 'handle_1') {
          console.log(`🧹 Eliminando índice global obsoleto en categories: ${idx.name}`);
          await db.collection('categories').dropIndex(idx.name);
        }
      }
    } catch (e) {
      console.warn('⚠️ Nota sobre índices:', e.message);
    }
  }

  // Dropear índices globales conflictivos si existen en products
  if (collNames.includes('products')) {
    try {
      const prodIndexes = await db.collection('products').indexes();
      for (const idx of prodIndexes) {
        if (idx.name === 'sku_1') {
          console.log(`🧹 Eliminando índice global obsoleto en products: ${idx.name}`);
          await db.collection('products').dropIndex(idx.name);
        }
      }
    } catch (e) {
      console.warn('⚠️ Nota sobre índices:', e.message);
    }
  }

  // Instanciar modelos
  const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);
  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
  const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
  const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

  // 2. Limpieza total de categorías, productos y órdenes huérfanas o previas para garantizar estado limpio 100%
  console.log('🧹 Purgando categorías, productos y órdenes existentes para reconstrucción aislada limpia...');
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  // 3. Crear / Actualizar Tienda 1: LBM Mayoreos
  console.log('🏪 Configurando Tienda: LBM Mayoreos (lbm-mayoreos)...');
  const lbmStore = await Store.findOneAndUpdate(
    { slug: 'lbm-mayoreos' },
    {
      name: 'La Barata Mayoreos',
      slug: 'lbm-mayoreos',
      plan: 'pro',
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxProducts: 200,
      contactWhatsApp: '5216671234567',
      customDomain: 'lbm.mitienda.com',
      logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
    },
    { upsert: true, new: true }
  );

  // 4. Crear / Actualizar Tienda 2: ACME Store México
  console.log('🏪 Configurando Tienda: ACME Store México (acme-store)...');
  const acmeStore = await Store.findOneAndUpdate(
    { slug: 'acme-store' },
    {
      name: 'ACME Store México',
      slug: 'acme-store',
      plan: 'enterprise',
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxProducts: 500,
      contactWhatsApp: '5215512345678',
      customDomain: 'acme.mitienda.com',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    },
    { upsert: true, new: true }
  );

  // 5. Configurar Usuarios
  console.log('👤 Configurando Usuarios de Acceso...');
  const salt = await bcrypt.genSalt(10);

  // 5.1 Super Admin
  const superAdminPasswordHash = await bcrypt.hash('SuperAdminPassword2026!', salt);
  await User.findOneAndUpdate(
    { nombre: 'superadmin' },
    {
      nombre: 'superadmin',
      email: 'superadmin@plataforma.com',
      contraseña: superAdminPasswordHash,
      role: 'superadmin',
      storeId: null,
      avatar: 'https://api.dicebear.com/7.x/personas/png?seed=superadmin',
      bio: 'Super Administrador Maestro de la Plataforma Multi-Tenant',
      telefono: '5215500000000',
    },
    { upsert: true }
  );

  // 5.2 LBM Admin
  const lbmAdminPasswordHash = await bcrypt.hash('admin123', salt);
  await User.findOneAndUpdate(
    { nombre: 'admin' },
    {
      nombre: 'admin',
      email: 'admin@lbm.com',
      contraseña: lbmAdminPasswordHash,
      role: 'admin',
      storeId: lbmStore._id,
      avatar: 'https://api.dicebear.com/7.x/personas/png?seed=lbm_admin',
      bio: 'Administrador de tienda La Barata Mayoreos',
      telefono: '5216671234567',
    },
    { upsert: true }
  );

  // 5.3 Acme Admin
  const acmeAdminPasswordHash = await bcrypt.hash('AcmePassword2026!', salt);
  await User.findOneAndUpdate(
    { nombre: 'acme_admin' },
    {
      nombre: 'acme_admin',
      email: 'admin@acme.com',
      contraseña: acmeAdminPasswordHash,
      role: 'admin',
      storeId: acmeStore._id,
      avatar: 'https://api.dicebear.com/7.x/personas/png?seed=acme_admin',
      bio: 'Store Manager oficial de ACME Store México',
      telefono: '5215512345678',
    },
    { upsert: true }
  );

  // 6. Poblar Categorías para LBM Mayoreos
  console.log('📁 Creando Categorías para LBM Mayoreos...');
  const lbmCategories = [
    { storeId: lbmStore._id, name: 'Playeras & Polos', handle: 'playeras-polos', description: 'Playeras lisas, estampadas y tipo polo de alta densidad' },
    { storeId: lbmStore._id, name: 'Sudaderas & Hoodies', handle: 'sudaderas-hoodies', description: 'Sudaderas con gorro, felpa pesada y cuello redondo' },
    { storeId: lbmStore._id, name: 'Pantalones Cargo', handle: 'pantalones-cargo', description: 'Pantalones tácticos, cargo y joggers corte slim' },
    { storeId: lbmStore._id, name: 'Calzado Urbano', handle: 'calzado-urbano', description: 'Tenis y calzado casual para mayoreo' }
  ];
  await Category.insertMany(lbmCategories);

  // 7. Poblar Categorías para ACME Store México
  console.log('📁 Creando Categorías para ACME Store México...');
  const acmeCategories = [
    { storeId: acmeStore._id, name: 'Apparel', handle: 'apparel', description: 'Prendas exclusivas, camisetas y hoodies con diseño Acme' },
    { storeId: acmeStore._id, name: 'Bags', handle: 'bags', description: 'Mochilas técnicas, tote bags y estuches de lona reforzada' },
    { storeId: acmeStore._id, name: 'Drinkware', handle: 'drinkware', description: 'Termos de acero inoxidable, mugs térmicos y botellas' },
    { storeId: acmeStore._id, name: 'Headwear', handle: 'headwear', description: 'Gorras snapback, dad caps y gorros de lana suave' },
    { storeId: acmeStore._id, name: 'Accessories', handle: 'accessories', description: 'Llaveros, stickers, pines y gadgets de oficina' }
  ];
  await Category.insertMany(acmeCategories);

  // 8. Poblar Productos para LBM Mayoreos
  console.log('👕 Creando Productos para LBM Mayoreos...');
  const lbmProducts = [
    {
      storeId: lbmStore._id,
      sku: 'LBM-POLO-001',
      title: 'Playera Polo Piqué Premium Mayoreo',
      description: 'Playera tipo polo 100% algodón peinado, paquete de mayoreo con botón reforzado.',
      price: 600,
      basePrice: 600,
      category: 'Playeras & Polos',
      image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
      stock: true,
      isPublished: true,
      variants: [{ size: 'M', stock: 50 }, { size: 'L', stock: 40 }, { size: 'XL', stock: 25 }]
    },
    {
      storeId: lbmStore._id,
      sku: 'LBM-HOODIE-002',
      title: 'Sudadera Hoodie Oversized Fleece',
      description: 'Sudadera pesada con capucha forrada y bolsa canguro, ideal para bordar o serigrafiar.',
      price: 600,
      basePrice: 600,
      category: 'Sudaderas & Hoodies',
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      stock: true,
      isPublished: true,
      variants: [{ size: 'M', stock: 35 }, { size: 'L', stock: 60 }]
    },
    {
      storeId: lbmStore._id,
      sku: 'LBM-CARGO-003',
      title: 'Pantalón Cargo Táctico Ripstop',
      description: 'Pantalón resistente al desgarre con 6 bolsillos utilitarios.',
      price: 600,
      basePrice: 600,
      category: 'Pantalones Cargo',
      image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
      stock: true,
      isPublished: true,
      variants: [{ size: '30', stock: 20 }, { size: '32', stock: 45 }, { size: '34', stock: 30 }]
    }
  ];
  const lbmProductsWithSlugs = lbmProducts.map(p => ({
    ...p,
    name: p.title,
    slug: slugify(p.title),
    handle: slugify(p.title),
  }));
  await Product.insertMany(lbmProductsWithSlugs);

  // 9. Poblar Productos para ACME Store México (URLs funcionales HTTP 200 garantizadas)
  console.log('📦 Creando Productos para ACME Store México...');
  const acmeProducts = [
    {
      storeId: acmeStore._id,
      sku: 'ACME-TSHIRT-BLK',
      title: 'Acme Circles T-Shirt',
      description: 'Camiseta de algodón orgánico 240 GSM con gráfico icónico de círculos concéntricos Acme.',
      price: 499,
      basePrice: 499,
      category: 'Apparel',
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      stock: true,
      isPublished: true,
      variants: [{ size: 'S', stock: 25 }, { size: 'M', stock: 50 }, { size: 'L', stock: 40 }, { size: 'XL', stock: 15 }]
    },
    {
      storeId: acmeStore._id,
      sku: 'ACME-HOODIE-PRM',
      title: 'Acme Heavyweight Hoodie',
      description: 'Hoodie con forro de felpa francesa pesada de 450 GSM. Ajuste oversized contemporáneo.',
      price: 1199,
      basePrice: 1199,
      category: 'Apparel',
      image_url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
      stock: true,
      isPublished: true,
      variants: [{ size: 'M', stock: 30 }, { size: 'L', stock: 35 }]
    },
    {
      storeId: acmeStore._id,
      sku: 'ACME-TOTE-CANV',
      title: 'Acme Canvas Utility Tote',
      description: 'Tote bag resistente construida con lona de algodón de 16oz con bolsillo interior para laptop.',
      price: 389,
      basePrice: 389,
      category: 'Bags',
      image_url: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&w=800&q=80',
      stock: true,
      isPublished: true,
      variants: [{ size: 'Unitalla', stock: 60 }]
    },
    {
      storeId: acmeStore._id,
      sku: 'ACME-MUG-CERAM',
      title: 'Acme Minimalist Ceramic Mug',
      description: 'Taza de cerámica artesanal mate de 350 ml apta para lavavajillas y microondas.',
      price: 249,
      basePrice: 249,
      category: 'Drinkware',
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      stock: true,
      isPublished: true,
      variants: [{ size: '350ml', stock: 80 }]
    },
    {
      storeId: acmeStore._id,
      sku: 'ACME-TUMBLER-SS',
      title: 'Acme Insulated Travel Tumbler',
      description: 'Termo térmico de doble pared de acero inoxidable al vacío. Mantiene bebidas calientes 12h y frías 24h.',
      price: 549,
      basePrice: 549,
      category: 'Drinkware',
      image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
      stock: true,
      isPublished: true,
      variants: [{ size: '500ml', stock: 45 }]
    },
    {
      storeId: acmeStore._id,
      sku: 'ACME-CAP-SNAP',
      title: 'Acme 6-Panel Snapback Cap',
      description: 'Gorra clásica de 6 paneles con bordado tonal de alta definición y cierre ajustable.',
      price: 349,
      basePrice: 349,
      category: 'Headwear',
      image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      stock: true,
      isPublished: true,
      variants: [{ size: 'Ajustable', stock: 40 }]
    }
  ];
  const acmeProductsWithSlugs = acmeProducts.map(p => ({
    ...p,
    name: p.title,
    slug: slugify(p.title),
    handle: slugify(p.title),
  }));
  await Product.insertMany(acmeProductsWithSlugs);

  // 10. Validaciones de comprobación inmediata
  const totalLbmCats = await Category.countDocuments({ storeId: lbmStore._id });
  const totalAcmeCats = await Category.countDocuments({ storeId: acmeStore._id });
  const totalLbmProds = await Product.countDocuments({ storeId: lbmStore._id });
  const totalAcmeProds = await Product.countDocuments({ storeId: acmeStore._id });

  console.log('================================================================');
  console.log('✨ RESUMEN DE AISLAMIENTO MULTI-TENANT CONFIGURADO CON ÉXITO:');
  console.log(`- Tienda LBM Mayoreos ID: ${lbmStore._id}`);
  console.log(`  Categorías creadas: ${totalLbmCats}`);
  console.log(`  Productos creados: ${totalLbmProds}`);
  console.log(`- Tienda ACME Store ID: ${acmeStore._id}`);
  console.log(`  Categorías creadas: ${totalAcmeCats} (Apparel, Bags, Drinkware, Headwear, Accessories)`);
  console.log(`  Productos creados: ${totalAcmeProds} (con imágenes 200 OK)`);
  console.log('================================================================');

  await mongoose.disconnect();
  console.log('🔒 Desconectado de Atlas. Limpieza y preparación completada al 100%.');
}

run().catch(err => {
  console.error('❌ Error ejecutando setup:', err);
  process.exit(1);
});
