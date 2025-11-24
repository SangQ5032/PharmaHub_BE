import Joi from 'joi'

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Tên danh mục là bắt buộc',
    'string.empty': 'Tên danh mục không được để trống',
  }),
  description: Joi.string().trim().optional().allow('', null),
  status: Joi.string().valid('active', 'inactive').optional().default('active'),
})

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().optional().allow('', null),
  status: Joi.string().valid('active', 'inactive').optional(),
})
