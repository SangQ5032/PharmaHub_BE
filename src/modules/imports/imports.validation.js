/**
 * Validation schemas cho import module (hỗ trợ đa đơn vị)
 */

/**
 * Validate import item with multi-unit support
 * @param {Object} item - Item dữ liệu
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
export const validateImportItem = (item) => {
  const errors = []

  if (!item.medicine_id) {
    errors.push('medicine_id là bắt buộc')
  }

  if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
    errors.push('quantity phải là số dương')
  }

  if (item.unit_price === undefined || isNaN(item.unit_price) || item.unit_price < 0) {
    errors.push('unit_price phải là số không âm')
  }

  // Validate unit format (chỉ kiểm tra format, validation thực sự sẽ được thực hiện trong service khi đã có medicine)
  if (item.unit && (typeof item.unit !== 'string' || item.unit.trim() === '')) {
    errors.push('unit phải là chuỗi không rỗng')
  }

  if (!item.batch_number || typeof item.batch_number !== 'string') {
    errors.push('batch_number là bắt buộc và phải là chuỗi')
  }

  if (!item.expiry_date) {
    errors.push('expiry_date là bắt buộc')
  } else {
    const expiryDate = new Date(item.expiry_date)
    if (isNaN(expiryDate.getTime())) {
      errors.push('expiry_date không hợp lệ')
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      expiryDate.setHours(0, 0, 0, 0)
      if (expiryDate < today) {
        errors.push(`expiry_date không được là quá khứ (${item.batch_number})`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate import create request
 * @param {Object} data - Request body
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
export const validateCreateImport = (data) => {
  const errors = []

  if (!data.branch_id) {
    errors.push('branch_id là bắt buộc')
  }

  if (!data.supplier_id) {
    errors.push('supplier_id là bắt buộc')
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('items phải là mảng có ít nhất 1 phần tử')
  } else {
    data.items.forEach((item, index) => {
      const validation = validateImportItem(item)
      if (!validation.valid) {
        validation.errors.forEach((error) => {
          errors.push(`Item ${index}: ${error}`)
        })
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate update status request
 * @param {String} status - Status mới
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
export const validateUpdateStatus = (status) => {
  const errors = []
  const validStatuses = ['pending', 'completed', 'cancelled']

  if (!status) {
    errors.push('status là bắt buộc')
  } else if (!validStatuses.includes(status)) {
    errors.push(`status phải là một trong: ${validStatuses.join(', ')}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
