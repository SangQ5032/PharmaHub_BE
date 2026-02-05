import Joi from 'joi'

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(1).max(100).optional(),
  phone: Joi.string().min(8).max(20).optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().max(255).optional(),
  avatarUrl: Joi.string().uri().optional(),
}).min(1)

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
})
