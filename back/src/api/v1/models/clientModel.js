import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const clientSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true, // Facilita buscar clientes por correo
  },
  password: {
    type: String,
    required: true,
    select: false, // No se devuelve en las consultas
  },
  phone: {
    type: String,
    trim: true,
    required: true,
  },
  taxId: {
    type: String,
    trim: true,
    default: '', // RFC, DNI o NIT para facturación
  },
  address: { // Dirección fiscal o principal del cliente
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
 
}, {
  timestamps: true,
  versionKey: false,
});

clientSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hook para encriptar la contraseña antes de guardarla
clientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas
clientSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


export const Client = model('Client', clientSchema);