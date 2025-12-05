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
  const validUnits = ['box', 'blister', 'tablet']

  if (!item.medicine_id) {
    errors.push('medicine_id là bắt buộc')
  }

  if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
    errors.push('quantity phải là số dương')
  }

  // Validate unit
  const unit = (item.unit || 'tablet').toLowerCase()
  if (!validUnits.includes(unit)) {
    errors.push(`unit phải là: ${validUnits.join(', ')}`)
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
  const validUnits = ['box', 'blister', 'tablet']

  if (!unit || !validUnits.includes(unit.toLowerCase())) {
    errors.push(`unit phải là: ${validUnits.join(', ')}`)
  }

  if (!quantity || isNaN(quantity) || quantity <= 0) {
    errors.push('quantity phải là số dương')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
