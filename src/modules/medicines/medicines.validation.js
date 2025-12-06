import Joi from 'joi'

export const createMedicineSchema = Joi.object({
  name: Joi.string().trim().required().messages({ 'any.required': 'Tên thuốc là bắt buộc' }),
  generic_name: Joi.string().trim().optional().allow('', null),
  brand_name: Joi.string().trim().optional().allow('', null),
  dosage_form: Joi.string().trim().optional().allow('', null),
  strength: Joi.string().trim().optional().allow('', null),
  base_unit: Joi.string()
    .trim()
    .required()
    .messages({ 'any.required': 'Đơn vị cơ sở (base_unit) là bắt buộc' }),
  packaging: Joi.string().trim().optional().allow('', null),
  units: Joi.array()
    .items(
      Joi.object({
        unit: Joi.string().trim().required().messages({ 'any.required': 'Tên đơn vị là bắt buộc' }),
        multiplier: Joi.number()
          .positive()
          .required()
          .messages({
            'any.required': 'Multiplier là bắt buộc',
            'number.positive': 'Multiplier phải > 0',
          }),
        price: Joi.number()
          .min(0)
          .required()
          .messages({
            'any.required': 'Giá theo đơn vị là bắt buộc',
            'number.base': 'Giá phải là số',
          }),
      })
    )
    .required()
    .messages({ 'any.required': 'Danh sách đơn vị (units) là bắt buộc' }),
  package_structure: Joi.object().optional().allow(null),
  category_id: Joi.string().trim().optional().allow('', null),
  prescription_required: Joi.boolean().optional().default(false),
  is_controlled: Joi.boolean().optional().default(false),
  manufacturer: Joi.string().trim().optional().allow('', null),
  country_of_origin: Joi.string().trim().optional().allow('', null),
  indications: Joi.string().trim().optional().allow('', null),
  contraindications: Joi.string().trim().optional().allow('', null),
  side_effects: Joi.string().trim().optional().allow('', null),
  usage_instructions: Joi.string().trim().optional().allow('', null),
  storage_conditions: Joi.string().trim().optional().allow('', null),
  registration_number: Joi.string().trim().optional().allow('', null),
  barcode: Joi.string().trim().optional().allow('', null),
  alert_threshold: Joi.number().min(0).optional().default(50),
  status: Joi.string().valid('active', 'inactive', 'discontinued').optional().default('active'),
})

export const updateMedicineSchema = Joi.object({
  name: Joi.string().trim().optional(),
  generic_name: Joi.string().trim().optional().allow('', null),
  brand_name: Joi.string().trim().optional().allow('', null),
  dosage_form: Joi.string().trim().optional().allow('', null),
  strength: Joi.string().trim().optional().allow('', null),
  base_unit: Joi.string().trim().optional(),
  packaging: Joi.string().trim().optional().allow('', null),
  units: Joi.array()
    .items(
      Joi.object({
        unit: Joi.string().trim().required().messages({ 'any.required': 'Tên đơn vị là bắt buộc' }),
        multiplier: Joi.number()
          .positive()
          .required()
          .messages({
            'any.required': 'Multiplier là bắt buộc',
            'number.positive': 'Multiplier phải > 0',
          }),
        price: Joi.number()
          .min(0)
          .required()
          .messages({
            'any.required': 'Giá theo đơn vị là bắt buộc',
            'number.base': 'Giá phải là số',
          }),
      })
    )
    .optional(),
  package_structure: Joi.object().optional().allow(null),
  category_id: Joi.string().trim().optional().allow('', null),
  prescription_required: Joi.boolean().optional(),
  is_controlled: Joi.boolean().optional(),
  manufacturer: Joi.string().trim().optional().allow('', null),
  country_of_origin: Joi.string().trim().optional().allow('', null),
  indications: Joi.string().trim().optional().allow('', null),
  contraindications: Joi.string().trim().optional().allow('', null),
  side_effects: Joi.string().trim().optional().allow('', null),
  usage_instructions: Joi.string().trim().optional().allow('', null),
  storage_conditions: Joi.string().trim().optional().allow('', null),
  registration_number: Joi.string().trim().optional().allow('', null),
  barcode: Joi.string().trim().optional().allow('', null),
  alert_threshold: Joi.number().min(0).optional(),
  status: Joi.string().valid('active', 'inactive', 'discontinued').optional(),
})
