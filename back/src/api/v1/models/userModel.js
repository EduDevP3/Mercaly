import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  contraseña: {
    type: String,
    required: true,
    select: false,
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  role: {
    type: String,
    default: 'store_admin',
    enum: ['super_admin', 'store_admin', 'admin', 'superadmin', 'editor'],
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  bio: {
    type: String,
    trim: true,
    default: 'Administrador de tienda',
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Índices compuestos para consultas rápidas
userSchema.index({ email: 1 });
userSchema.index({ storeId: 1, role: 1 });

// Hook para encriptar la contraseña antes de guardarla
userSchema.pre('save', async function (next) {
  if (!this.isModified('contraseña')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.contraseña);
};

export const User = model('User', userSchema);
export default User;