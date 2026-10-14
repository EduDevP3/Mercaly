/**
 * Middleware para prevenir inyecciones NoSQL en MongoDB.
 * Elimina recursivamente cualquier clave que empiece con '$' o contenga '.'
 * tanto en body, query como params de Express.
 */

const sanitizeObject = (target) => {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map(sanitizeObject);
  }

  for (const key of Object.keys(target)) {
    // Si la clave empieza con $ (operador de MongoDB) o contiene punto (.)
    if (key.startsWith('$') || key.includes('.')) {
      delete target[key];
      continue;
    }

    if (typeof target[key] === 'object' && target[key] !== null) {
      sanitizeObject(target[key]);
    }
  }

  return target;
};

export const mongoSanitize = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

export default mongoSanitize;
