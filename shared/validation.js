const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({ status: 'fail', errors });
    }
    next();
  };
};

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(50).required()
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  product: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(2000),
    price: Joi.number().positive().required(),
    category: Joi.string().required(),
    inventory: Joi.number().integer().min(0).default(0),
    images: Joi.array().items(Joi.string().uri()),
    attributes: Joi.object(),
    status: Joi.string().valid('active', 'draft', 'archived').default('draft')
  }),
  order: Joi.object({
    items: Joi.array().items(Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required()
    })).min(1).required(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required()
    }).required()
  }),
  review: Joi.object({
    productId: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().min(5).max(100).required(),
    content: Joi.string().min(10).max(2000).required()
  })
};

module.exports = { validate, schemas };

