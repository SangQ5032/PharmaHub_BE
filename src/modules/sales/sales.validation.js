/**
 * Validation schemas cho sales module (hỗ trợ đa đơn vị)
 */

/**
 * Validate sales item with multi-unit support
 * @param {Object} item - Item dữ liệu
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
export const validateSalesItem = (item) => {
  const errors = []

  if (!item.medicine_id) {
    errors.push('medicine_id là bắt buộc')
  }

  if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
    errors.push('quantity phải là số dương')
  }

  // Validate unit format (chỉ kiểm tra format, validation thực sự sẽ được thực hiện trong service khi đã có medicine)
  const unit = (item.unit || 'tablet').toLowerCase()
  if (!unit || typeof unit !== 'string' || unit.trim() === '') {
    errors.push('unit phải là chuỗi không rỗng')
  }

  if (item.unit_price !== undefined && (isNaN(item.unit_price) || item.unit_price < 0)) {
    errors.push('unit_price phải là số không âm')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate invoice create request
 * @param {Object} data - Request body
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
export const validateCreateInvoice = (data) => {
  const errors = []

  if (!data.branch_id) {
    errors.push('branch_id là bắt buộc')
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('items phải là mảng có ít nhất 1 phần tử')
  } else {
    data.items.forEach((item, index) => {
      const validation = validateSalesItem(item)
      if (!validation.valid) {
        validation.errors.forEach((error) => {
          errors.push(`Item ${index}: ${error}`)
        })
      }
    })
  }

  // Validate discount
  if (data.discount !== undefined) {
    const discount = Number(data.discount ?? 0)
    if (isNaN(discount) || discount < 0) {
      errors.push('discount phải là số không âm')
    }
  }

  // Validate tax_rate
  if (data.tax_rate !== undefined) {
    const taxRate = Number(data.tax_rate ?? 0)
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
      errors.push('tax_rate phải là số từ 0-100')
    }
  }

  // Validate payment_method
  const validMethods = ['cash', 'card', 'bank', 'e-wallet']
  if (data.payment_method && !validMethods.includes(data.payment_method.toLowerCase())) {
    errors.push(`payment_method phải là: ${validMethods.join(', ')}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate inventory check - ensure enough stock
 * @param {Number} requiredBaseUnits - Required quantity in base units
 * @param {Number} availableBaseUnits - Available quantity in base units
 * @param {String} medicineName - Name of medicine (for error message)
 * @returns {Object} - {valid: boolean, error: string|null}
 */
export const validateInventoryAvailable = (requiredBaseUnits, availableBaseUnits, medicineName) => {
  if (availableBaseUnits < requiredBaseUnits) {
    return {
      valid: false,
      error: `Không đủ tồn kho cho ${medicineName}. Cần: ${requiredBaseUnits}, Có: ${availableBaseUnits}`,
    }
  }
  return {
    valid: true,
    error: null,
  }
}

/**
 * Validate unit conversion parameters
 * @param {String} unit - Unit type
 * @param {Number} quantity - Quantity
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
export const validateUnitAndQuantity = (unit, quantity) => {
  const errors = []

  // Validate unit format (chỉ kiểm tra format, validation thực sự sẽ được thực hiện trong service khi đã có medicine)
  if (!unit || typeof unit !== 'string' || unit.trim() === '') {
    errors.push('unit phải là chuỗi không rỗng')
  }

  if (!quantity || isNaN(quantity) || quantity <= 0) {
    errors.push('quantity phải là số dương')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate discount data when creating customer discount
 * @param {Object} discountData - Discount data
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
export const validateCustomerDiscount = (discountData) => {
  const errors = []
  const { discount_type, discount_value, discount_max_amount } = discountData

  // Validate discount_type
  if (!discount_type) {
    errors.push('discount_type là bắt buộc')
  } else if (!['percentage', 'fixed'].includes(discount_type)) {
    errors.push('discount_type phải là "percentage" hoặc "fixed"')
  }

  // Validate discount_value
  if (discount_value === undefined || discount_value === null) {
    errors.push('discount_value là bắt buộc')
  } else if (isNaN(discount_value) || discount_value < 0) {
    errors.push('discount_value phải là số không âm')
  } else if (discount_type === 'percentage' && (discount_value < 0 || discount_value > 100)) {
    errors.push('discount_value (percentage) phải từ 0-100')
  }

  // Validate discount_max_amount (chỉ cần cho percentage)
  if (discount_max_amount !== undefined && discount_max_amount !== null) {
    if (isNaN(discount_max_amount) || discount_max_amount < 0) {
      errors.push('discount_max_amount phải là số không âm')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
