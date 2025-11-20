import Joi from 'joi'

export const createSupplierSchema = Joi.object({
  name: Joi.string().trim().required().messages({ 'any.required': 'Tên nhà cung cấp là bắt buộc' }),
  contact: Joi.object({
    phone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .required()
      .messages({
        'any.required': 'Số điện thoại là bắt buộc',
        'string.pattern.base': 'Số điện thoại không hợp lệ',
      }),
    email: Joi.string()
      .email()
      .optional()
      .allow('', null)
      .messages({ 'string.email': 'Email không hợp lệ' }),
    address: Joi.string().trim().required().messages({ 'any.required': 'Địa chỉ là bắt buộc' }),
  }).required(),
  note: Joi.string().optional().allow('', null),
  status: Joi.string().valid('active', 'inactive').optional(),
})

export const updateSupplierSchema = Joi.object({
  name: Joi.string().trim().optional(),
  contact: Joi.object({
    phone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .optional()
      .messages({ 'string.pattern.base': 'Số điện thoại không hợp lệ' }),
    email: Joi.string()
      .email()
      .optional()
      .allow('', null)
      .messages({ 'string.email': 'Email không hợp lệ' }),
    address: Joi.string().trim().optional(),
  }).optional(),
  note: Joi.string().optional().allow('', null),
  status: Joi.string().valid('active', 'inactive').optional(),
})
