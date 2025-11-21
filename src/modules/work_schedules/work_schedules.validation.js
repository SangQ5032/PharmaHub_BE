// Validate date format YYYY-MM-DD
export const validateDateFormat = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) {
    return false
  }

  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

// Validate shift
export const validateShift = (shift) => {
  return ['morning', 'afternoon'].includes(shift)
}

// Validate ObjectId format
export const validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Get date range validation
export const validateDateRange = (from, to) => {
  if (!validateDateFormat(from) || !validateDateFormat(to)) {
    return false
  }

  const fromDate = new Date(from)
  const toDate = new Date(to)

  return fromDate <= toDate
}

// Check if date is within range
export const isDateInRange = (date, from, to) => {
  const dateObj = new Date(date)
  const fromDate = new Date(from)
  const toDate = new Date(to)

  return dateObj >= fromDate && dateObj <= toDate
}

// Format error message
export const formatValidationError = (field, message) => {
  return `${field}: ${message}`
}
