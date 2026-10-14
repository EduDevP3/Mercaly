import Joi from 'joi';

export const registerSchema = Joi.object({
  nombre: Joi.string().min(3).max(30).required(),
  contraseña: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  nombre: Joi.string().required(),
  contraseña: Joi.string().required(),
});
