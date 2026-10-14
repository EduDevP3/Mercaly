import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'El nombre de la categoría es obligatorio.'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres.'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres.'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres.'],
    default: '',
  },
  handle: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  }
}, {
  timestamps: true,
  versionKey: false,
});

// Middleware pre-validation para generar handle amigable
categorySchema.pre('validate', function(next) {
  if (this.name && !this.handle) {
    this.handle = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Índices de unicidad compuestos por Tenant (dos tiendas distintas pueden tener la categoría 'Playeras')
categorySchema.index({ storeId: 1, handle: 1 }, { unique: true });
categorySchema.index({ storeId: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
export { Category };
