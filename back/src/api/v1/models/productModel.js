import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  sku: { type: String, trim: true },
  size: { type: String, trim: true },   // CH, M, G, XL, 28, 30, etc.
  color: { type: String, trim: true },  // Negro, Marino, Beige, etc.
  price: { type: Number, min: 0 },      // Sobrescribe basePrice si difiere
  stock: { type: Number, default: 0, min: 0 }
}, { _id: true });

const productSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  // Identificadores y Nombres (compatibilidad dual name/title y slug/handle)
  name: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true,
  },
  handle: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },

  // Precios
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  basePrice: {
    type: Number,
    min: 0,
    default: function() { return this.price; }
  },
  currency: {
    type: String,
    default: "MXN",
    uppercase: true,
  },

  // Multimedia
  image_url: {
    type: String,
    required: true,
  },
  image_public_id: {
    type: String,
    default: '',
  },
  images: [{
    type: String,
  }],

  // Variantes
  variants: [variantSchema],

  // Estado y Disponibilidad
  stock: {
    type: Boolean,
    default: true,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },

  // Categorías
  category: {
    type: String,
    required: true,
    trim: true,
  },
  categoryRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  bgColor: {
    type: String,
    default: "#FFFFFF",
    trim: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Middleware pre-validate para sincronizar name/title y slug/handle/images
productSchema.pre('validate', function(next) {
  if (!this.name && this.title) this.name = this.title;
  if (!this.title && this.name) this.title = this.name;
  if (!this.slug && this.handle) this.slug = this.handle;
  if (!this.handle && this.slug) this.handle = this.slug;
  if (this.basePrice === undefined && this.price !== undefined) this.basePrice = this.price;
  if (this.price === undefined && this.basePrice !== undefined) this.price = this.basePrice;
  if (this.image_url && (!this.images || this.images.length === 0)) {
    this.images = [this.image_url];
  }
  next();
});

// Índices de cobertura Multi-Tenant sin escaneos globales (COLLSCAN)
productSchema.index({ storeId: 1, slug: 1 }, { unique: true });
productSchema.index({ storeId: 1, sku: 1 }, { unique: true });
productSchema.index({ storeId: 1, isPublished: 1, category: 1 });
productSchema.index({ storeId: 1, title: 'text', category: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
export { Product };