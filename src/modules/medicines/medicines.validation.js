import Joi from 'joi'

export const createMedicineSchema = Joi.object({
  name: Joi.string().trim().required().messages({ 'any.required': 'Tên thuốc là bắt buộc' }),
  description: Joi.string().trim().optional().allow('', null),
  image_url: Joi.string().trim().uri().optional().allow('', null).messages({
    'string.uri': 'URL hình ảnh không hợp lệ',
  }),
  base_unit: Joi.string()
    .trim()
    .required()
    .messages({ 'any.required': 'Đơn vị cơ sở (base_unit) là bắt buộc' }),
  units: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .default([])
    .messages({ 'array.base': 'Danh sách đơn vị phải là mảng' }),
  is_active: Joi.boolean().optional().default(true),
})

export const updateMedicineSchema = Joi.object({
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().optional().allow('', null),
  image_url: Joi.string().trim().uri().optional().allow('', null).messages({
    'string.uri': 'URL hình ảnh không hợp lệ',
  }),
  base_unit: Joi.string().trim().optional(),
  units: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .messages({ 'array.base': 'Danh sách đơn vị phải là mảng' }),
  is_active: Joi.boolean().optional(),
})
