import Joi from 'joi';

export const registerClientSchema = Joi.object({
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().required(),
  taxId: Joi.string().allow('').optional(),
  address: Joi.object({
    street: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
    postalCode: Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
  }).optional(),
});

export const loginClientSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
