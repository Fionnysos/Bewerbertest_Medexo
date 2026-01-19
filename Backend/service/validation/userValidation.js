const Joi = require("joi");

const createSchema = Joi.object({
  name: Joi.string().min(1).max(120).required(),
  email: Joi.string().email().max(254).required(),
  location: Joi.string().allow("", null).max(120),
  ipAddress: Joi.string().allow("", null).max(45),
  active: Joi.boolean(),
  lastLogin: Joi.date().iso().allow(null),
  blocked: Joi.boolean(),
}).options({ abortEarly: false, allowUnknown: false });

const patchSchema = Joi.object({
  name: Joi.string().min(1).max(120),
  email: Joi.string().email().max(254),
  location: Joi.string().allow("", null).max(120),
  ipAddress: Joi.string().allow("", null).max(45),
  active: Joi.boolean(),
  lastLogin: Joi.date().iso().allow(null),
  blocked: Joi.boolean(),
}).options({ abortEarly: false, allowUnknown: false });

const userValidation = (data, all = true) => {
  const schema = all ? createSchema : patchSchema;
  const { error } = schema.validate(data);
  return error ? error.details : null;
};

module.exports.userValidation = userValidation;
