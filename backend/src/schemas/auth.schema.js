import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "Password is required",
    }),
  username: Joi.string().min(3).max(30).alphanum().required().messages({
    "string.min":
      "Username must be at least 3 characters long and cannot contain spaces",
    "string.max": "Username cannot be longer than 30 characters",
    "string.alphanum": "Username can only contain letters and numbers",
    "any.required": "Username is required",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});
