import { Schema, model } from 'mongoose';

const alertSchema = new Schema({
  // Basic schema, to be expanded later
  name: String,
  description: String,
}, {
  timestamps: true,
  versionKey: false,
});

export const Alert = model('Alert', alertSchema);
