const Joi = require("joi");

// Validation schemas
const schemas = {
  // User registration schema
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().min(1).max(100).required(),
  }),

  // User login schema
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Task creation schema
  createTask: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(5000).optional().allow(null, ""),
    due_date: Joi.date().iso().optional().allow(null),
    priority: Joi.string().valid("low", "medium", "high", "urgent").required(),
    status: Joi.string()
      .valid("todo", "in_progress", "review", "completed")
      .required(),
    assigned_to_id: Joi.string().uuid().optional().allow(null),
    creator_id: Joi.string().uuid().required(),
  }),

  // Task update schema
  updateTask: Joi.object({
    title: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(5000).optional().allow(null, ""),
    due_date: Joi.date().iso().optional().allow(null),
    priority: Joi.string().valid("low", "medium", "high", "urgent").optional(),
    status: Joi.string()
      .valid("todo", "in_progress", "review", "completed")
      .optional(),
    assigned_to_id: Joi.string().uuid().optional().allow(null),
  }).min(1),

  // Profile update schema
  updateProfile: Joi.object({
    fullName: Joi.string().min(1).max(100).optional(),
    email: Joi.string().email().optional(),
    avatarUrl: Joi.string().uri().optional().allow(null),
  }).min(1),
};

// Validation middleware function
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((detail) => detail.message),
      });
    }
    next();
  };
};

module.exports = {
  validate,
  schemas,
};
