import Joi from 'joi';

export const createOrderSchema = Joi.object({
  orderItems: Joi.array().items(
    Joi.object({
      product: Joi.string().required().messages({
        'any.required': 'El ID del producto es requerido.',
        'string.empty': 'El ID del producto no puede estar vacío.'
      }),
      sku: Joi.string().required().messages({
        'any.required': 'El SKU del producto es requerido.',
        'string.empty': 'El SKU del producto no puede estar vacío.'
      }),
      title: Joi.string().required().messages({
        'any.required': 'El título del producto es requerido.',
        'string.empty': 'El título del producto no puede estar vacío.'
      }),
      quantity: Joi.number().integer().min(1).required().messages({
        'any.required': 'La cantidad del producto es requerida.',
        'number.base': 'La cantidad debe ser un número.',
        'number.integer': 'La cantidad debe ser un número entero.',
        'number.min': 'La cantidad debe ser al menos 1.'
      }),
      image_url: Joi.string().required().messages({
        'any.required': 'La URL de la imagen del producto es requerida.',
        'string.empty': 'La URL de la imagen del producto no puede estar vacía.',
      }),
      price: Joi.number().min(0).required().messages({
        'any.required': 'El precio del producto es requerido.',
        'number.base': 'El precio debe ser un número.',
        'number.min': 'El precio no puede ser negativo.'
      }),
      size: Joi.string().allow('').optional(),
    })
  ).min(1).required().messages({
    'any.required': 'Los artículos del pedido son requeridos.',
    'array.empty': 'El pedido debe contener al menos un artículo.',
    'array.min': 'El pedido debe contener al menos un artículo.'
  }),
  shippingAddress: Joi.object({
    address: Joi.string().required().messages({
      'any.required': 'La dirección de envío es requerida.',
      'string.empty': 'La dirección de envío no puede estar vacía.'
    }),
    city: Joi.string().required().messages({
      'any.required': 'La ciudad de envío es requerida.',
      'string.empty': 'La ciudad de envío no puede estar vacía.'
    }),
    postalCode: Joi.string().required().messages({
      'any.required': 'El código postal de envío es requerido.',
      'string.empty': 'El código postal de envío no puede estar vacío.'
    }),
    country: Joi.string().required().messages({
      'any.required': 'El país de envío es requerido.',
      'string.empty': 'El país de envío no puede estar vacía.'
    }),
    state: Joi.string().allow('').optional(), // Optional and can be empty
  }).required().messages({
    'any.required': 'La dirección de envío es requerida.'
  }),
  itemsPrice: Joi.number().min(0).required(),
  taxPrice: Joi.number().min(0).required(),
  shippingPrice: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled').required().messages({
    'any.required': 'El estado de la orden es requerido.',
    'any.only': 'El estado de la orden no es válido. Los estados permitidos son: Pending, Processing, Shipped, Delivered, Cancelled.'
  }),
});