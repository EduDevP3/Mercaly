import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug inválido: solo minúsculas, números y guiones'],
  },
  description: {
    type: String,
    default: '',
  },
  whatsappNumber: {
    type: String,
    required: true,
    match: [/^\d{10,15}$/, 'Número WhatsApp inválido: formato numérico internacional sin símbolos (10-15 dígitos)'],
  },
  logoUrl: {
    type: String,
    default: '',
  },
  bannerUrl: {
    type: String,
    default: '',
  },
  primaryColor: {
    type: String,
    default: '#111827',
  },
  currency: {
    type: String,
    default: 'MXN',
    uppercase: true,
  },

  // Control de Suscripción y Operación (SaaS Multi-tenant)
  isActive: {
    type: Boolean,
    default: true,
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free',
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'grace_period', 'suspended'],
    default: 'active',
  },
  subscriptionExpiresAt: {
    type: Date,
    required: true,
  },
  maxProducts: {
    type: Number,
    default: 50,
  },
  billingNotes: {
    type: String,
    default: '',
  },
  whatsappOrderTemplate: {
    type: String,
    default: '¡Hola! Me gustaría realizar el siguiente pedido desde su catálogo digital:\n\n{{items}}\n\nTotal estimado: {{total}}',
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Índices de cobertura optimizados para consultas del tier M0 sin COLLSCAN
storeSchema.index({ slug: 1 }, { unique: true });
storeSchema.index({ isActive: 1, subscriptionStatus: 1, subscriptionExpiresAt: 1 });

const Store = mongoose.model('Store', storeSchema);
export default Store;
export { Store };
