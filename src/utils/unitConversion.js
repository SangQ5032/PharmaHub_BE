/**
 * Unit Conversion Utilities for Multi-Unit Medicine System
 * Handles conversion between different units dynamically based on package_structure
 * All conversions are based on base_unit
 */

import mongoose from 'mongoose'
import { AppError } from './AppError.js'

/**
 * Map đơn vị tiếng Việt sang tiếng Anh
 * @param {String} unit - Đơn vị (có thể là tiếng Việt hoặc tiếng Anh)
 * @returns {String} - Đơn vị đã được normalize về tiếng Anh
 */
export const normalizeUnit = (unit) => {
  if (!unit || typeof unit !== 'string') {
    return unit
  }

  const normalized = unit.toLowerCase().trim()

  // Map unit names (có thể là tiếng Việt) sang tiếng Anh
  // Hỗ trợ cả đơn vị đơn và đơn vị ghép
  const unitNameMap = {
    // Tiếng Việt -> Tiếng Anh (đơn vị đơn)
    viên: 'tablet',
    vien: 'tablet',
    vỉ: 'blister',
    vi: 'blister',
    hộp: 'box',
    hop: 'box',
    lọ: 'bottle',
    lo: 'bottle',
    chai: 'bottle',
    tuýp: 'tube',
    tuyp: 'tube',
    ống: 'vial',
    ong: 'vial',
    gói: 'pack',
    goi: 'pack',
    thùng: 'carton',
    thung: 'carton',
    // Tiếng Việt -> Tiếng Anh (đơn vị ghép)
    'hộp tuýp': 'box tube',
    'hop tuyp': 'box tube',
    'hộp ống': 'box vial',
    'hop ong': 'box vial',
    'hộp viên': 'box tablet',
    'hop vien': 'box tablet',
    'hộp vỉ': 'box blister',
    'hop vi': 'box blister',
    'thùng hộp': 'carton box',
    'thung hop': 'carton box',
    // Tiếng Anh (giữ nguyên)
    tablet: 'tablet',
    blister: 'blister',
    box: 'box',
    bottle: 'bottle',
    tube: 'tube',
    vial: 'vial',
    pack: 'pack',
    carton: 'carton',
    'box tube': 'box tube',
    'box vial': 'box vial',
    'box tablet': 'box tablet',
    'box blister': 'box blister',
    'carton box': 'carton box',
  }

  return unitNameMap[normalized] || normalized
}

/**
 * Chuẩn hóa đơn vị để so sánh (loại bỏ khoảng trắng thừa, chuyển về lowercase)
 * @param {String} unit - Đơn vị
 * @returns {String} - Đơn vị đã được chuẩn hóa
 */
const normalizeForComparison = (unit) => {
  if (!unit || typeof unit !== 'string') {
    return ''
  }
  // Loại bỏ khoảng trắng thừa, chuyển về lowercase, trim
  return unit.replace(/\s+/g, ' ').toLowerCase().trim()
}

/**
 * Lấy tên đơn vị từ base_unit (có thể là ObjectId hoặc object đã populate)
 * @param {Object|String} baseUnit - Base unit (ObjectId hoặc object với name/short_name)
 * @returns {String} - Tên đơn vị
 */
export const getBaseUnitName = (baseUnit) => {
  if (!baseUnit) {
    return 'tablet'
  }

  // Nếu là object đã populate, lấy name hoặc short_name
  if (typeof baseUnit === 'object' && baseUnit !== null) {
    return baseUnit.short_name || baseUnit.name || 'tablet'
  }

  // Nếu là string, trả về trực tiếp
  if (typeof baseUnit === 'string') {
    return baseUnit
  }

  // Fallback
  return 'tablet'
}

/**
 * Lấy danh sách đơn vị hợp lệ từ package_structure và base_unit
 * @param {Object} medicine - Medicine document with package_structure
 * @returns {Array<String>} - Array of valid unit names
 */
export const getValidUnits = (medicine) => {
  if (!medicine) {
    return ['tablet'] // fallback
  }

  const units = []

  // Lấy tên base_unit (xử lý cả ObjectId và object đã populate)
  const baseUnitName = getBaseUnitName(medicine.base_unit)
  if (baseUnitName && !units.includes(baseUnitName)) {
    units.push(baseUnitName)
  }

  // Lấy tất cả đơn vị từ package_structure
  if (medicine.package_structure && typeof medicine.package_structure === 'object') {
    Object.keys(medicine.package_structure).forEach((unit) => {
      const normalizedUnit = normalizeForComparison(unit)
      if (!units.some((u) => normalizeForComparison(u) === normalizedUnit)) {
        units.push(unit) // Giữ nguyên key gốc từ package_structure
      }
    })
    // Nếu có package_structure, trả về units từ structure (không fallback)
    return units
  }

  // Nếu không có package_structure, thử lấy từ units array (nếu có)
  if (Array.isArray(medicine.units) && medicine.units.length > 0) {
    medicine.units.forEach((unit) => {
      // unit có thể là ObjectId hoặc object đã populate
      let unitName = null
      if (typeof unit === 'object' && unit !== null) {
        unitName = unit.short_name || unit.name
      } else if (typeof unit === 'string') {
        unitName = unit
      }

      if (unitName) {
        const normalizedUnit = normalizeForComparison(unitName)
        if (!units.some((u) => normalizeForComparison(u) === normalizedUnit)) {
          units.push(unitName)
        }
      }
    })

    // Nếu có units từ array, trả về
    if (units.length > 0) {
      return units
    }
  }

  // Fallback: nếu không có package_structure và không có units array (hoặc chỉ có base_unit)
  // Trả về các đơn vị mặc định để backward compatibility với hệ thống cũ
  // Điều này cho phép sử dụng các đơn vị phổ biến: box, blister, tablet
  if (!medicine.package_structure) {
    // Nếu chỉ có base_unit hoặc units array rỗng
    if (units.length === 0 || (units.length === 1 && units[0] === baseUnitName)) {
      // Nếu có unit_ratios, có nghĩa là medicine có nhiều đơn vị nhưng chưa được populate
      // Trong trường hợp này, cho phép sử dụng các đơn vị mặc định
      const hasUnitRatios =
        medicine.unit_ratios &&
        ((medicine.unit_ratios instanceof Map && medicine.unit_ratios.size > 0) ||
          (typeof medicine.unit_ratios === 'object' &&
            Object.keys(medicine.unit_ratios).length > 0))

      if (hasUnitRatios || units.length === 0) {
        return ['box', 'blister', 'tablet']
      }
    }
  }

  return units.length > 0 ? units : ['tablet']
}

/**
 * Kiểm tra đơn vị có hợp lệ không dựa trên package_structure
 * @param {Object} medicine - Medicine document with package_structure
 * @param {String} unit - Unit name to validate (có thể là tiếng Việt hoặc tiếng Anh)
 * @returns {Boolean} - True if unit is valid
 */
export const isValidUnit = (medicine, unit) => {
  if (!medicine || !unit || typeof unit !== 'string') {
    return false
  }

  const unitNormalized = normalizeForComparison(unit)
  const validUnits = getValidUnits(medicine)

  // So sánh với valid units (có thể là tiếng Việt hoặc tiếng Anh)
  for (const validUnit of validUnits) {
    const validUnitNormalized = normalizeForComparison(validUnit)

    // So sánh trực tiếp (đã normalize)
    if (unitNormalized === validUnitNormalized) {
      return true
    }

    // So sánh sau khi normalize cả hai về tiếng Anh (nếu có mapping)
    const unitNormalizedToEn = normalizeUnit(unitNormalized)
    const validUnitNormalizedToEn = normalizeUnit(validUnitNormalized)
    if (unitNormalizedToEn === validUnitNormalizedToEn && unitNormalizedToEn !== unitNormalized) {
      return true
    }

    // So sánh ngược lại: nếu cả hai normalize về cùng một giá trị
    // Ví dụ: "hộp tuýp" và "Hộp Tuýp" đều normalize về "hộp tuýp"
    if (unitNormalizedToEn === validUnitNormalizedToEn) {
      return true
    }
  }

  return false
}

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

  // Normalize đơn vị từ tiếng Việt sang tiếng Anh
  const normalizedUnit = normalizeUnit(unit)

  // Validate unit dựa trên package_structure thay vì hardcode
  if (!isValidUnit(medicine, normalizedUnit)) {
    const validUnits = getValidUnits(medicine)
    throw new AppError(
      400,
      `Đơn vị "${unit}" không hợp lệ. Các đơn vị hợp lệ: ${validUnits.join(', ')}`
    )
  }

  // If unit is already base_unit (có thể là tiếng Việt hoặc tiếng Anh)
  const baseUnitName = getBaseUnitName(medicine.base_unit)
  const normalizedBaseUnit = normalizeUnit(baseUnitName)
  if (normalizedUnit === normalizedBaseUnit) {
    console.log(
      `[DEBUG convertToBaseUnit] Unit "${unit}" is already base unit, returning quantity as-is`
    )
    return normalizedQuantity
  }

  // Get package_structure from medicine
  // FALLBACK: If no package_structure, cần tính toán dựa trên unit_ratios hoặc báo lỗi
  if (!medicine.package_structure || typeof medicine.package_structure !== 'object') {
    // Nếu không có package_structure, thử dùng unit_ratios để tính toán
    console.warn(
      `[WARNING] Medicine ${medicine.name} (${medicine._id}) has no package_structure. Attempting to use unit_ratios for conversion.`
    )

    // Thử tìm ratio từ unit_ratios hoặc từ units array
    let conversionRatio = 1

    // Tìm trong unit_ratios (Map hoặc object)
    if (medicine.unit_ratios) {
      // unit_ratios có thể là Map hoặc object
      const ratios =
        medicine.unit_ratios instanceof Map
          ? Object.fromEntries(medicine.unit_ratios)
          : medicine.unit_ratios

      // Tìm unit_id tương ứng với unit name
      if (Array.isArray(medicine.units)) {
        const unitObj = medicine.units.find((u) => {
          const unitObjName = typeof u === 'object' ? u.short_name || u.name : null
          return unitObjName && normalizeUnit(unitObjName) === normalizedUnit
        })

        if (unitObj) {
          const unitId = typeof unitObj === 'object' ? unitObj._id?.toString() : unitObj?.toString()
          if (unitId && ratios[unitId]) {
            conversionRatio = ratios[unitId]
          }
        }
      }

      // Nếu không tìm thấy, thử tìm bằng ratio_to_base từ unit object
      if (conversionRatio === 1 && Array.isArray(medicine.units)) {
        const unitObj = medicine.units.find((u) => {
          const unitObjName = typeof u === 'object' ? u.short_name || u.name : null
          return unitObjName && normalizeUnit(unitObjName) === normalizedUnit
        })

        if (unitObj && typeof unitObj === 'object' && unitObj.ratio_to_base) {
          conversionRatio = unitObj.ratio_to_base
        }
      }
    }

    if (conversionRatio === 1) {
      // Không tìm thấy ratio, báo lỗi
      throw new AppError(
        400,
        `Không thể chuyển đổi đơn vị "${unit}" vì thuốc "${medicine.name}" không có package_structure hoặc unit_ratios. Vui lòng cập nhật thông tin thuốc.`
      )
    }

    console.log(`[DEBUG convertToBaseUnit] Using ratio ${conversionRatio} for unit "${unit}"`)
    return Math.floor(normalizedQuantity * conversionRatio)
  }

  const structure = medicine.package_structure
  let baseUnits = normalizedQuantity

  // Navigate from requested unit down to base unit
  // Tìm key trong structure: thử cả unit gốc và unit đã normalize
  let currentUnit = structure[unit.toLowerCase()] ? unit.toLowerCase() : normalizedUnit
  const baseUnitNameFromMedicine = getBaseUnitName(medicine.base_unit)
  const baseUnit = normalizeUnit(baseUnitNameFromMedicine)

  while (currentUnit !== baseUnit && normalizeUnit(currentUnit) !== baseUnit) {
    // Tìm key trong structure: thử cả currentUnit gốc và đã normalize
    let unitConfig = structure[currentUnit]
    if (!unitConfig) {
      unitConfig = structure[normalizeUnit(currentUnit)]
    }
    if (!unitConfig) {
      // Thử tìm ngược lại: tìm key nào normalize ra currentUnit
      const foundKey = Object.keys(structure).find(
        (key) => normalizeUnit(key) === normalizeUnit(currentUnit)
      )
      if (foundKey) {
        unitConfig = structure[foundKey]
        currentUnit = foundKey // Cập nhật currentUnit để tiếp tục với key gốc
      }
    }

    if (!unitConfig || !unitConfig.contains) {
      throw new AppError(
        400,
        `Không tìm thấy cấu trúc cho đơn vị: ${unit}. Các đơn vị có sẵn: ${Object.keys(structure).join(', ')}`
      )
    }

    baseUnits *= unitConfig.contains
    let nextUnit = unitConfig.child

    if (!nextUnit) {
      currentUnit = baseUnit
    } else {
      // Tìm key trong structure cho child unit
      nextUnit = nextUnit.toLowerCase()
      if (structure[nextUnit]) {
        currentUnit = nextUnit
      } else {
        // Thử tìm key nào normalize ra nextUnit
        const foundKey = Object.keys(structure).find(
          (key) => normalizeUnit(key) === normalizeUnit(nextUnit)
        )
        currentUnit = foundKey || normalizeUnit(nextUnit)
      }
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

  // Normalize đơn vị từ tiếng Việt sang tiếng Anh
  const normalizedUnit = normalizeUnit(unit)

  // Validate unit dựa trên package_structure thay vì hardcode
  if (!isValidUnit(medicine, normalizedUnit)) {
    const validUnits = getValidUnits(medicine)
    throw new AppError(
      400,
      `Đơn vị "${unit}" không hợp lệ. Các đơn vị hợp lệ: ${validUnits.join(', ')}`
    )
  }

  // If target unit is base_unit (có thể là tiếng Việt hoặc tiếng Anh)
  const baseUnitName = getBaseUnitName(medicine.base_unit)
  const normalizedBaseUnit = normalizeUnit(baseUnitName)
  if (normalizedUnit === normalizedBaseUnit) {
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
  // Tìm key trong structure cho base_unit (có thể là tiếng Việt)
  // normalizedBaseUnit đã được khai báo ở trên
  const baseUnitNameFromMedicine = getBaseUnitName(medicine.base_unit)
  let currentUnit = structure[baseUnitNameFromMedicine]
    ? baseUnitNameFromMedicine
    : normalizedBaseUnit
  const path = []

  // Build path from base to target unit
  // So sánh cả unit gốc và unit đã normalize
  while (
    currentUnit !== normalizedUnit &&
    normalizeUnit(currentUnit) !== normalizedUnit &&
    currentUnit !== unit.toLowerCase()
  ) {
    // Find parent unit that contains current unit
    let found = false
    for (const [key, config] of Object.entries(structure)) {
      // So sánh child: có thể là tiếng Việt hoặc tiếng Anh
      const childNormalized = normalizeUnit(config.child || '')
      const currentNormalized = normalizeUnit(currentUnit)
      if (
        config.child === currentUnit ||
        childNormalized === currentNormalized ||
        normalizeUnit(config.child) === currentNormalized
      ) {
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
 * Convert unit price from specified unit to base unit price
 * @param {Object} medicine - Medicine document with package_structure
 * @param {Number} unitPrice - Price for the specified unit
 * @param {String} unit - Unit type ("box", "blister", "tablet", "hộp", etc.)
 * @returns {Number} - Price for base unit
 * @throws {AppError} - If unit is invalid or package_structure is missing
 */
export const convertUnitPriceToBaseUnit = (medicine, unitPrice, unit) => {
  // Validate inputs
  if (!medicine) {
    throw new AppError(400, 'Medicine không tồn tại')
  }

  const normalizedPrice = Number(unitPrice)
  if (isNaN(normalizedPrice) || normalizedPrice < 0) {
    throw new AppError(400, 'Giá nhập không hợp lệ')
  }

  if (!unit || typeof unit !== 'string') {
    throw new AppError(400, 'Đơn vị tính không hợp lệ')
  }

  // Normalize đơn vị từ tiếng Việt sang tiếng Anh
  const normalizedUnit = normalizeUnit(unit)

  // If unit is already base_unit (có thể là tiếng Việt hoặc tiếng Anh)
  const baseUnitName = getBaseUnitName(medicine.base_unit)
  const normalizedBaseUnit = normalizeUnit(baseUnitName)
  if (normalizedUnit === normalizedBaseUnit) {
    return normalizedPrice
  }

  // Validate unit dựa trên package_structure
  if (!isValidUnit(medicine, normalizedUnit)) {
    const validUnits = getValidUnits(medicine)
    throw new AppError(
      400,
      `Đơn vị "${unit}" không hợp lệ. Các đơn vị hợp lệ: ${validUnits.join(', ')}`
    )
  }

  // FALLBACK: If no package_structure, cần tính toán dựa trên unit_ratios hoặc báo lỗi
  if (!medicine.package_structure || typeof medicine.package_structure !== 'object') {
    // Nếu không có package_structure, thử dùng unit_ratios để tính toán
    console.warn(
      `[WARNING] Medicine ${medicine.name} (${medicine._id}) has no package_structure. Attempting to use unit_ratios for price conversion.`
    )

    // Thử tìm ratio từ unit_ratios hoặc từ units array
    let conversionRatio = 1

    // Tìm trong unit_ratios (Map hoặc object)
    if (medicine.unit_ratios) {
      // unit_ratios có thể là Map hoặc object
      const ratios =
        medicine.unit_ratios instanceof Map
          ? Object.fromEntries(medicine.unit_ratios)
          : medicine.unit_ratios

      // Tìm unit_id tương ứng với unit name
      if (Array.isArray(medicine.units)) {
        const unitObj = medicine.units.find((u) => {
          const unitObjName = typeof u === 'object' ? u.short_name || u.name : null
          return unitObjName && normalizeUnit(unitObjName) === normalizedUnit
        })

        if (unitObj) {
          const unitId = typeof unitObj === 'object' ? unitObj._id?.toString() : unitObj?.toString()
          if (unitId && ratios[unitId]) {
            conversionRatio = ratios[unitId]
          }
        }
      }

      // Nếu không tìm thấy, thử tìm bằng ratio_to_base từ unit object
      if (conversionRatio === 1 && Array.isArray(medicine.units)) {
        const unitObj = medicine.units.find((u) => {
          const unitObjName = typeof u === 'object' ? u.short_name || u.name : null
          return unitObjName && normalizeUnit(unitObjName) === normalizedUnit
        })

        if (unitObj && typeof unitObj === 'object' && unitObj.ratio_to_base) {
          conversionRatio = unitObj.ratio_to_base
        }
      }
    }

    if (conversionRatio === 1) {
      // Không tìm thấy ratio, báo lỗi
      throw new AppError(
        400,
        `Không thể chuyển đổi giá đơn vị "${unit}" vì thuốc "${medicine.name}" không có package_structure hoặc unit_ratios. Vui lòng cập nhật thông tin thuốc.`
      )
    }

    // Convert price: divide by conversion ratio
    // Ví dụ: 39000 VND/hộp, 1 hộp = 30 viên → 39000 / 30 = 1300 VND/viên
    console.log(
      `[DEBUG convertUnitPriceToBaseUnit] Using ratio ${conversionRatio} for unit "${unit}", converting price: ${normalizedPrice} / ${conversionRatio} = ${normalizedPrice / conversionRatio}`
    )
    const baseUnitPrice = normalizedPrice / conversionRatio
    return Math.round(baseUnitPrice * 100) / 100 // Round to 2 decimal places
  }

  const structure = medicine.package_structure
  // normalizedBaseUnit đã được khai báo ở trên

  // Calculate conversion factor from unit to base unit
  let conversionFactor = 1
  // Tìm key trong structure: thử cả unit gốc và unit đã normalize
  let currentUnit = structure[unit.toLowerCase()] ? unit.toLowerCase() : normalizedUnit

  // Navigate from requested unit down to base unit
  while (
    currentUnit !== normalizedBaseUnit &&
    normalizeUnit(currentUnit) !== normalizedBaseUnit &&
    currentUnit !== baseUnitName &&
    normalizeUnit(currentUnit) !== baseUnitName
  ) {
    // Tìm key trong structure: thử cả currentUnit gốc và đã normalize
    let unitConfig = structure[currentUnit]
    if (!unitConfig) {
      unitConfig = structure[normalizeUnit(currentUnit)]
    }
    if (!unitConfig) {
      // Thử tìm ngược lại: tìm key nào normalize ra currentUnit
      const foundKey = Object.keys(structure).find(
        (key) => normalizeUnit(key) === normalizeUnit(currentUnit)
      )
      if (foundKey) {
        unitConfig = structure[foundKey]
        currentUnit = foundKey // Cập nhật currentUnit để tiếp tục với key gốc
      }
    }

    if (!unitConfig || !unitConfig.contains) {
      throw new AppError(
        400,
        `Không tìm thấy cấu trúc cho đơn vị: ${unit}. Các đơn vị có sẵn: ${Object.keys(structure).join(', ')}`
      )
    }

    conversionFactor *= unitConfig.contains
    let nextUnit = unitConfig.child

    if (!nextUnit) {
      currentUnit = normalizedBaseUnit
    } else {
      // Tìm key trong structure cho child unit
      nextUnit = nextUnit.toLowerCase()
      if (structure[nextUnit]) {
        currentUnit = nextUnit
      } else {
        // Thử tìm key nào normalize ra nextUnit
        const foundKey = Object.keys(structure).find(
          (key) => normalizeUnit(key) === normalizeUnit(nextUnit)
        )
        currentUnit = foundKey || normalizeUnit(nextUnit)
      }
    }
  }

  // Convert price: divide by conversion factor
  // Example: 39000 VND/hộp, 1 hộp = 10 vỉ, 1 vỉ = 10 viên
  // conversionFactor = 10 * 10 = 100
  // baseUnitPrice = 39000 / 100 = 390 VND/viên
  const baseUnitPrice = normalizedPrice / conversionFactor

  return Math.round(baseUnitPrice * 100) / 100 // Round to 2 decimal places
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

  // Normalize đơn vị từ tiếng Việt sang tiếng Anh
  const normalizedUnit = normalizeUnit(unit)

  // Validate unit dựa trên package_structure thay vì hardcode
  if (!isValidUnit(medicine, normalizedUnit)) {
    const validUnits = getValidUnits(medicine)
    throw new AppError(
      400,
      `Đơn vị "${unit}" không hợp lệ. Các đơn vị hợp lệ: ${validUnits.join(', ')}`
    )
  }

  // Try new format first: prices.price_per_unit
  if (medicine.prices && typeof medicine.prices === 'object') {
    const prices = medicine.prices

    // Return price for the unit
    const baseUnitName = getBaseUnitName(medicine.base_unit)
    const normalizedBaseUnit = normalizeUnit(baseUnitName)
    if (
      normalizedUnit === 'tablet' ||
      normalizedUnit === normalizedBaseUnit ||
      normalizedUnit === baseUnitName
    ) {
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
 * Calculate unit price from batch retail_price
 * Batch retail_price is in base unit, convert to requested unit
 * @param {Object} medicine - Medicine document with package_structure
 * @param {Object} batch - Batch document with retail_price (in base unit)
 * @param {String} unit - Unit type ("box", "blister", "tablet")
 * @returns {Number} - Price for the specified unit
 * @throws {AppError} - If unit is invalid or batch price is missing
 */
export const calculateUnitPriceFromBatch = (medicine, batch, unit) => {
  // Validate inputs
  if (!medicine) {
    throw new AppError(400, 'Medicine không tồn tại')
  }

  if (!batch) {
    throw new AppError(400, 'Batch không tồn tại')
  }

  if (!unit || typeof unit !== 'string') {
    throw new AppError(400, 'Đơn vị tính không hợp lệ')
  }

  // Get retail_price from batch (in base unit)
  const batchRetailPrice = Number(batch.retail_price || 0)
  if (isNaN(batchRetailPrice) || batchRetailPrice <= 0) {
    throw new AppError(
      400,
      `Batch không có giá bán lẻ hợp lệ (retail_price: ${batch.retail_price})`
    )
  }

  // Normalize đơn vị từ tiếng Việt sang tiếng Anh
  const normalizedUnit = normalizeUnit(unit)

  // Get base unit name
  const baseUnitName = getBaseUnitName(medicine.base_unit)
  const normalizedBaseUnit = normalizeUnit(baseUnitName)

  // If unit is already base unit, return batch retail_price
  if (
    normalizedUnit === 'tablet' ||
    normalizedUnit === normalizedBaseUnit ||
    normalizedUnit === baseUnitName
  ) {
    return batchRetailPrice
  }

  // Validate unit dựa trên package_structure
  if (!isValidUnit(medicine, normalizedUnit)) {
    const validUnits = getValidUnits(medicine)
    throw new AppError(
      400,
      `Đơn vị "${unit}" không hợp lệ. Các đơn vị hợp lệ: ${validUnits.join(', ')}`
    )
  }

  // Calculate conversion ratio: how many base units in 1 requested unit
  // Use convertToBaseUnit to find this: if 1 hộp = 30 viên, then convertToBaseUnit(medicine, 1, "hộp") = 30
  try {
    const baseUnitsInOneUnit = convertToBaseUnit(medicine, 1, unit)
    if (baseUnitsInOneUnit <= 0) {
      throw new AppError(400, `Không thể tính tỷ lệ chuyển đổi cho đơn vị "${unit}"`)
    }

    // Convert: batch retail_price is per base unit, multiply by ratio to get price per requested unit
    // Example: batch retail_price = 1000 VND/viên, 1 hộp = 30 viên → price = 1000 * 30 = 30000 VND/hộp
    const unitPrice = batchRetailPrice * baseUnitsInOneUnit
    return Math.round(unitPrice * 100) / 100 // Round to 2 decimal places
  } catch (error) {
    throw new AppError(
      400,
      `Không thể chuyển đổi giá từ base unit sang "${unit}": ${error.message}`
    )
  }
}

/**
 * Deduct quantity from batches using FEFO (First Expiry, First Out) method
 * Automatically handles multi-batch deduction when one batch doesn't have enough stock
 * @param {String} medicineId - Medicine ID
 * @param {String} branchId - Branch ID
 * @param {Number} baseUnitsNeeded - Total quantity to deduct (in base units/tablets)
 * @param {Object} Batch - Batch model
 * @param {Object} session - Mongoose session for transaction (optional)
 * @returns {Promise<Array>} - Array of deductions: [{batch_id, quantity_deducted}]
 * @throws {AppError} - If not enough stock or medicine not found
 */
export const deductFromBatchesFEFO = async (
  medicineId,
  branchId,
  baseUnitsNeeded,
  Batch,
  session = null
) => {
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
  let batchQuery = Batch.find({
    medicine_id: medicineId,
    branch_id: branchId,
    status: 'active',
    expiry_date: { $gte: new Date() }, // Only non-expired batches
  }).sort({ expiry_date: 1 }) // Oldest expiry first

  // Use session if provided (for transaction support)
  if (session) {
    batchQuery = batchQuery.session(session)
  }

  const batches = await batchQuery

  if (!batches || batches.length === 0) {
    throw new AppError(400, 'Không có lô hàng nào có sẵn cho thuốc này')
  }

  // Calculate total available quantity (quantity luôn ở base unit)
  const totalAvailable = batches.reduce((sum, batch) => {
    return sum + (Number(batch.quantity) || 0)
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

    const batchQuantity = Number(batch.quantity) || 0
    const deductedAmount = Math.min(remaining, batchQuantity)

    // Update batch quantity - ensure it's a valid number (quantity luôn ở base unit)
    batch.quantity = Math.max(0, batchQuantity - deductedAmount)

    // Ensure initial_quantity is set (for old batches without this field)
    if (!batch.initial_quantity) {
      batch.initial_quantity = batchQuantity
    }

    // Update status if batch is now empty
    if (batch.quantity === 0) {
      batch.status = 'sold_out'
    }

    // Save batch with session if provided (for transaction support)
    await batch.save({ session })

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

  // Lấy danh sách đơn vị hợp lệ từ package_structure
  const validUnits = getValidUnits(medicine)
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
 * Validate package_structure
 * @param {Object} packageStructure - Package structure object
 * @param {String} baseUnit - Base unit name (default: 'tablet')
 * @returns {Boolean} - True if valid
 */
export const validatePackageStructure = (packageStructure, baseUnit = 'tablet') => {
  if (!packageStructure || typeof packageStructure !== 'object') {
    return false
  }

  // Must have base_unit in structure
  if (!packageStructure[baseUnit]) {
    return false
  }

  // base_unit must have contains: 1 and child: null
  const baseUnitConfig = packageStructure[baseUnit]
  if (baseUnitConfig.contains !== 1 || baseUnitConfig.child !== null) {
    return false
  }

  // All units must have 'contains' as positive number
  for (const [key, value] of Object.entries(packageStructure)) {
    if (typeof value.contains !== 'number' || value.contains <= 0) {
      return false
    }

    // Validate child reference (nếu có child, child phải tồn tại trong structure hoặc là base_unit)
    if (value.child !== null && value.child !== baseUnit) {
      if (!packageStructure[value.child]) {
        return false // Child unit không tồn tại trong structure
      }
    }
  }

  // Check for cycles (đơn giản - không có unit nào trỏ về chính nó)
  for (const [key, value] of Object.entries(packageStructure)) {
    if (value.child === key) {
      return false // Cycle detected
    }
  }

  return true
}
