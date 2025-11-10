import Joi from 'joi'

export const createMedicineSchema = Joi.object({
  name: Joi.string().trim().required().messages({ 'any.required': 'Tên thuốc là bắt buộc' }),
  description: Joi.string().allow('', null),
  category: Joi.string()
    .trim()
    .required()
    .messages({ 'any.required': 'Phân loại thuốc là bắt buộc' }),
  unit: Joi.string().trim().required().messages({ 'any.required': 'Đơn vị tính là bắt buộc' }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({ 'any.required': 'Giá bán là bắt buộc', 'number.base': 'Giá bán phải là số' }),
  expiry_date: Joi.date()
    .required()
    .messages({
      'any.required': 'Hạn sử dụng là bắt buộc',
      'date.base': 'Hạn sử dụng không hợp lệ',
    }),
  supplier_id: Joi.string().required().messages({ 'any.required': 'Nhà cung cấp là bắt buộc' }),
  warning_threshold: Joi.number().min(0).optional(),
  manufacturer: Joi.string().optional().allow('', null),
  quantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'any.required': 'Số lượng là bắt buộc',
      'number.base': 'Số lượng phải là số',
      'number.integer': 'Số lượng phải là số nguyên',
      'number.min': 'Số lượng phải lớn hơn hoặc bằng 0',
    }),
})
