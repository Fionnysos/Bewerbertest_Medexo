const Joi = require("joi");

/**
 * ============================================================
 * USER REQUEST VALIDATION
 * This file validates incoming request data BEFORE it reaches
 * the database. It protects the API from invalid input.
 * ============================================================
 */

/**
 * Schema for creating a new user.
 * All required fields must be present.
 */
const createSchema = Joi.object({
  // User's full name (required)
  name: Joi.string().min(1).max(120).required(),

  // User's email address (required, must be valid email format)
  email: Joi.string().email().max(254).required(),

  // Optional location (e.g. city)
  location: Joi.string().allow("", null).max(120),

  // Optional IP address
  ipAddress: Joi.string().allow("", null).max(45),

  // Indicates whether the user is active
  active: Joi.boolean(),

  // Optional last login timestamp
  lastLogin: Joi.date().iso().allow(null),

  // Indicates whether the user is blocked
  blocked: Joi.boolean(),
}).options({
  // Collect all validation errors instead of stopping at the first one
  abortEarly: false,

  // Reject unknown fields that are not defined in the schema
  allowUnknown: false,
});

/**
 * Schema for updating an existing user.
 * All fields are optional (partial update).
 */
const patchSchema = Joi.object({
  name: Joi.string().min(1).max(120),
  email: Joi.string().email().max(254),
  location: Joi.string().allow("", null).max(120),
  ipAddress: Joi.string().allow("", null).max(45),
  active: Joi.boolean(),
  lastLogin: Joi.date().iso().allow(null),
  blocked: Joi.boolean(),
}).options({
  abortEarly: false,
  allowUnknown: false,
});

/**
 * Validates user request data.
 *
 * @param {Object} data - Request body (req.body)
 * @param {Boolean} all - true = create, false = update
 * @returns {Array|null} - List of validation errors or null if valid
 */
const userValidation = (data, all = true) => {
  // Choose schema depending on request type
  const schema = all ? createSchema : patchSchema;

  // Validate incoming data
  const { error } = schema.validate(data);

  // Return detailed errors or null if validation passed
  return error ? error.details : null;
};

// Export validation function
module.exports.userValidation = userValidation;
