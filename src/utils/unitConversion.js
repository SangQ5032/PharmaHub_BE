/**
 * Unit Conversion Utilities for Multi-Unit Medicine System
 * Handles conversion between different units (box, blister, tablet)
 * All conversions are based on base_unit (tablet)
 */

import mongoose from 'mongoose'
import { AppError } from './AppError.js'

/**
 * Convert quantity from specified unit to base unit (tablet)
 * @param {Object} medicine - Medicine document with package_structure
 * @param {Number} quantity - Quantity in the specified unit
 * @param {String} unit - Unit type ("box", "blister", "tablet")
 * @returns {Number} - Quantity in base units (tablets)
 * @throws {AppError} - If unit is invalid or package_structure is missing
 */
export const convertToBaseUnit = (medicine, quantity, unit) => {
  // Validate inputs
  if (!medicine) {
    throw new AppError(400, 'Medicine không tồn tại')
  }

  // Normalize quantity to number
  const normalizedQuantity = Number(quantity)
  if (isNaN(normalizedQuantity) || normalizedQuantity <= 0) {
    throw new AppError(400, 'Số lượng phải lớn hơn 0')
  }

  if (!unit || typeof unit !== 'string') {
    throw new AppError(400, 'Đơn vị tính không hợp lệ')
  }

  const validUnits = ['box', 'blister', 'tablet']
  if (!validUnits.includes(unit.toLowerCase())) {
    throw new AppError(400, `Đơn vị chỉ được là: ${validUnits.join(', ')}`)
  }

  // If unit is already base_unit (tablet)
  if (unit.toLowerCase() === medicine.base_unit || unit.toLowerCase() === 'tablet') {
    return normalizedQuantity
  }

  // Get package_structure from medicine
  // FALLBACK: If no package_structure, treat current unit as base_unit
  if (!medicine.package_structure || typeof medicine.package_structure !== 'object') {
    // Fallback logic: treat input quantity as if it's in base units
    // This allows old medicines without package_structure to still work
    console.warn(
      `[FALLBACK] Medicine ${medicine.name} (${medicine._id}) has no package_structure, using quantity as base units`
    )
    return normalizedQuantity
  }

  const structure = medicine.package_structure
  let baseUnits = normalizedQuantity

  // Navigate from requested unit down to base unit
  let currentUnit = unit.toLowerCase()

  while (currentUnit !== medicine.base_unit && currentUnit !== 'tablet') {
    const unitConfig = structure[currentUnit]

    if (!unitConfig || !unitConfig.contains) {
      throw new AppError(400, `Không tìm thấy cấu trúc cho đơn vị: ${currentUnit}`)
    }

    baseUnits *= unitConfig.contains
    currentUnit = unitConfig.child

    if (!currentUnit) {
      currentUnit = medicine.base_unit || 'tablet'
    }
  }

  return Math.floor(baseUnits)
}

/**
 * Convert quantity from base unit (tablet) to specified unit
 * @param {Object} medicine - Medicine document with package_structure
 * @param {Number} baseUnits - Quantity in base units (tablets)
 * @param {String} unit - Target unit ("box", "blister", "tablet")
 * @returns {Object} - { quantity: number, remainder: number }
 *                      remainder: số lượng tôi không đủ để tạo thêm 1 đơn vị
 * @throws {AppError} - If unit is invalid or package_structure is missing
 */
export const convertFromBaseUnit = (medicine, baseUnits, unit) => {
  // Validate inputs
  if (!medicine) {
    throw new AppError(400, 'Medicine không tồn tại')
  }

  // Normalize baseUnits to number
  const normalizedBaseUnits = Number(baseUnits)
  if (isNaN(normalizedBaseUnits) || normalizedBaseUnits < 0) {
    throw new AppError(400, 'Base units phải >= 0')
  }

  if (!unit || typeof unit !== 'string') {
    throw new AppError(400, 'Đơn vị tính không hợp lệ')
  }

  const validUnits = ['box', 'blister', 'tablet']
  if (!validUnits.includes(unit.toLowerCase())) {
    throw new AppError(400, `Đơn vị chỉ được là: ${validUnits.join(', ')}`)
  }

  // If target unit is base_unit (tablet)
  if (unit.toLowerCase() === medicine.base_unit || unit.toLowerCase() === 'tablet') {
    return {
      quantity: Math.floor(normalizedBaseUnits),
      remainder: 0,
    }
  }

  // Get package_structure from medicine
  // FALLBACK: If no package_structure, return baseUnits as-is with no conversion
  if (!medicine.package_structure || typeof medicine.package_structure !== 'object') {
    // Fallback logic: treat baseUnits as if it's already in the requested unit
    console.warn(
      `[FALLBACK] Medicine ${medicine.name} (${medicine._id}) has no package_structure, returning baseUnits as-is`
    )
    return {
      quantity: Math.floor(normalizedBaseUnits),
      remainder: 0,
    }
  }

  const structure = medicine.package_structure
  let remaining = baseUnits
  let quantity = 0

  // Navigate from base unit up to requested unit
  let currentUnit = medicine.base_unit || 'tablet'
  const path = []

  // Build path from base to target unit
  while (currentUnit !== unit.toLowerCase()) {
    // Find parent unit that contains current unit
    let found = false
    for (const [key, config] of Object.entries(structure)) {
      if (config.child === currentUnit) {
        path.push({ unit: key, config })
        currentUnit = key
        found = true
        break
      }
    }

    if (!found) {
      throw new AppError(400, `Không tìm thấy đường dẫn từ base unit đến ${unit}`)
    }
  }

  // Convert from base to target
  for (const step of path) {
    const divisor = step.config.contains
    quantity = Math.floor(remaining / divisor)
    remaining = remaining % divisor
  }

  return {
    quantity: Math.floor(quantity),
    remainder: Math.floor(remaining),
  }
}

/**
 * Calculate unit price based on medicine pricing structure
 * @param {Object} medicine - Medicine document with prices
 * @param {String} unit - Unit type ("box", "blister", "tablet")
 * @returns {Number} - Price for the specified unit
 * @throws {AppError} - If unit is invalid or prices are missing
 */
export const calculateUnitPrice = (medicine, unit) => {
  // Validate inputs
  if (!medicine) {
    throw new AppError(400, 'Medicine không tồn tại')
  }

  if (!unit || typeof unit !== 'string') {
    throw new AppError(400, 'Đơn vị tính không hợp lệ')
  }

  const validUnits = ['box', 'blister', 'tablet']
  if (!validUnits.includes(unit.toLowerCase())) {
    throw new AppError(400, `Đơn vị chỉ được là: ${validUnits.join(', ')}`)
  }

  const normalizedUnit = unit.toLowerCase()

  // Try new format first: prices.price_per_unit
  if (medicine.prices && typeof medicine.prices === 'object') {
    const prices = medicine.prices

    // Return price for the unit
    if (normalizedUnit === 'tablet' || normalizedUnit === medicine.base_unit) {
      if (prices.base_unit_price) return prices.base_unit_price
    }

    if (prices.price_per_unit && prices.price_per_unit[normalizedUnit] !== undefined) {
      const price = prices.price_per_unit[normalizedUnit]
      if (price) return price
    }
  }

  // Fallback to old format: units array
  if (Array.isArray(medicine.units) && medicine.units.length > 0) {
    const unitConfig = medicine.units.find((u) => u.unit && u.unit.toLowerCase() === normalizedUnit)
    if (unitConfig && unitConfig.price) {
      return unitConfig.price
    }
  }

  // FALLBACK: Return 0 if price not found
  console.warn(
    `[FALLBACK] No price found for unit ${unit} in medicine ${medicine.name}, returning 0`
  )
  return 0
}

/**
 * Deduct quantity from batches using FEFO (First Expiry, First Out) method
 * Automatically handles multi-batch deduction when one batch doesn't have enough stock
 * @param {String} medicineId - Medicine ID
 * @param {String} branchId - Branch ID
 * @param {Number} baseUnitsNeeded - Total quantity to deduct (in base units/tablets)
 * @param {Object} Batch - Batch model
 * @returns {Promise<Array>} - Array of deductions: [{batch_id, quantity_deducted}]
 * @throws {AppError} - If not enough stock or medicine not found
 */
export const deductFromBatchesFEFO = async (medicineId, branchId, baseUnitsNeeded, Batch) => {
  // Validate inputs
  if (!mongoose.Types.ObjectId.isValid(medicineId)) {
    throw new AppError(400, 'Medicine ID không hợp lệ')
  }

  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    throw new AppError(400, 'Branch ID không hợp lệ')
  }

  // Normalize baseUnitsNeeded to number
  const normalizedBaseUnitsNeeded = Number(baseUnitsNeeded)
  if (isNaN(normalizedBaseUnitsNeeded) || normalizedBaseUnitsNeeded <= 0) {
    throw new AppError(400, 'Số lượng cần trừ phải lớn hơn 0')
  }

  // Get all active batches for this medicine in this branch, ordered by expiry_date (FEFO)
  const batches = await Batch.find({
    medicine_id: medicineId,
    branch_id: branchId,
    status: 'active',
    expiry_date: { $gte: new Date() }, // Only non-expired batches
  }).sort({ expiry_date: 1 }) // Oldest expiry first

  if (!batches || batches.length === 0) {
    throw new AppError(400, 'Không có lô hàng nào có sẵn cho thuốc này')
  }

  // Calculate total available quantity
  const totalAvailable = batches.reduce((sum, batch) => {
    return sum + (Number(batch.quantity_in_base_unit) || 0)
  }, 0)

  if (totalAvailable < normalizedBaseUnitsNeeded) {
    throw new AppError(
      400,
      `Không đủ tồn kho. Cần: ${normalizedBaseUnitsNeeded}, Có sẵn: ${totalAvailable}`
    )
  }

  // Deduct from batches
  const deductions = []
  let remaining = normalizedBaseUnitsNeeded

  for (const batch of batches) {
    if (remaining <= 0) break

    const batchQuantity = Number(batch.quantity_in_base_unit) || 0
    const deductedAmount = Math.min(remaining, batchQuantity)

    // Update batch quantity - ensure it's a valid number
    batch.quantity_in_base_unit = Math.max(0, batchQuantity - deductedAmount)

    // Ensure initial_quantity_in_base_unit is set (for old batches without this field)
    if (!batch.initial_quantity_in_base_unit) {
      batch.initial_quantity_in_base_unit = Number(batch.initial_quantity) || batchQuantity
    }

    // Update status if batch is now empty
    if (batch.quantity_in_base_unit === 0) {
      batch.status = 'sold_out'
    }

    await batch.save()

    deductions.push({
      batch_id: batch._id,
      quantity_deducted: deductedAmount,
    })

    remaining -= deductedAmount
  }

  return deductions
}

/**
 * Calculate total quantity in base units from multiple items
 * @param {Array} items - Array of items with { quantity, unit, medicine }
 * @returns {Number} - Total quantity in base units
 */
export const calculateTotalBaseUnits = (items) => {
  if (!Array.isArray(items)) {
    throw new AppError(400, 'Items phải là array')
  }

  return items.reduce((total, item) => {
    if (!item.medicine || !item.unit) {
      throw new AppError(400, 'Mỗi item phải có medicine và unit')
    }

    const baseUnits = convertToBaseUnit(item.medicine, item.quantity, item.unit)
    return total + baseUnits
  }, 0)
}

/**
 * Format medicine with all unit options and prices
 * @param {Object} medicine - Medicine document
 * @returns {Object} - Formatted medicine with all unit prices
 */
export const formatMedicineWithPrices = (medicine) => {
  if (!medicine) {
    throw new AppError(400, 'Medicine không tồn tại')
  }

  const validUnits = ['box', 'blister', 'tablet']
  const unitPrices = {}

  for (const unit of validUnits) {
    try {
      unitPrices[unit] = calculateUnitPrice(medicine, unit)
    } catch (e) {
      // Unit price not available
      unitPrices[unit] = null
    }
  }

  return {
    ...(medicine.toObject?.() || medicine),
    prices: {
      ...medicine.prices,
      unit_prices: unitPrices,
    },
  }
}

/**
 * Validate unit array from medicine
 * @param {Array} units - Units array from medicine
 * @returns {Boolean} - True if valid
 */
export const validatePackageStructure = (packageStructure) => {
  if (!packageStructure || typeof packageStructure !== 'object') {
    return false
  }

  // Must have 'tablet' as base unit
  if (!packageStructure.tablet) {
    return false
  }

  // tablet must have contains: 1 and child: null
  if (packageStructure.tablet.contains !== 1 || packageStructure.tablet.child !== null) {
    return false
  }

  // All units must have 'contains' as positive number
  for (const [key, value] of Object.entries(packageStructure)) {
    if (typeof value.contains !== 'number' || value.contains <= 0) {
      return false
    }
  }

  return true
}
