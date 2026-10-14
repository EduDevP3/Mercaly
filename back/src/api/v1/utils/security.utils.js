import mongoose from 'mongoose';

/**
 * Escapa caracteres especiales de expresiones regulares para prevenir
 * ataques de ReDoS (Regular Expression Denial of Service) y errores de sintaxis en MongoDB.
 * @param {string} text - El texto a escapar.
 * @returns {string} Texto seguro para usar en RegExp o $regex.
 */
export const escapeRegex = (text) => {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, 100).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * Valida si un string es un ObjectId de MongoDB válido.
 * @param {string} id - El ID a validar.
 * @returns {boolean} True si es válido, False en caso contrario.
 */
export const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
};
