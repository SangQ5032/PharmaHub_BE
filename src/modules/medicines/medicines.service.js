// MODULE: MEDICINES - SERVICE (Business Logic Layer)
// Mục đích: Xử lý logic nghiệp vụ
// - Không làm việc trực tiếp với Express (req/res)
// - Không viết truy vấn Mongoose trực tiếp (ủy quyền cho repository)
import medicinesRepo from './medicines.repository.js'
import { AppError } from '../../utils/AppError.js'
import { formatMedicineWithPrices } from '../../utils/unitConversion.js'

/**
 * Chuyển đổi units array thành prices object
 * @param {Array} units - Array of units: [{unit, multiplier, price}]
 * @param {String} baseUnit - Base unit name (e.g., "tablet")
 * @param {Object} packageStructure - Package structure object
 * @returns {Object} - Prices object: {base_unit_price, price_per_unit: {dynamic units}}
 */
const convertUnitsToPrices = (units, baseUnit, packageStructure) => {
  if (!Array.isArray(units) || units.length === 0) {
    return {
      base_unit_price: 0,
      price_per_unit: {},
    }
  }

  // Map unit names (có thể là tiếng Việt) sang tiếng Anh
  const unitNameMap = {
    // Tiếng Việt -> Tiếng Anh
    viên: 'tablet',
    vien: 'tablet',
    vỉ: 'blister',
    vi: 'blister',
    hộp: 'box',
    hop: 'box',
    lọ: 'bottle',
    lo: 'bottle',
    // Tiếng Anh (giữ nguyên)
    tablet: 'tablet',
    blister: 'blister',
    box: 'box',
    bottle: 'bottle',
  }

  // Tìm base unit price (unit có multiplier = 1 hoặc unit name = base_unit)
  let baseUnitPrice = 0
  const pricePerUnit = {} // Linh hoạt - hỗ trợ bất kỳ đơn vị nào

  // Tính toán multiplier cho tất cả các đơn vị từ package_structure
  const unitMultipliers = {} // { unitName: multiplier }
  if (packageStructure && typeof packageStructure === 'object') {
    // Tính multiplier cho mỗi đơn vị trong package_structure
    for (const [unitName, config] of Object.entries(packageStructure)) {
      if (unitName === baseUnit) continue // Skip base unit

      let multiplier = config.contains || 1
      let child = config.child

      // Tính tổng multiplier từ đơn vị này đến base unit
      while (child && packageStructure[child]) {
        multiplier *= packageStructure[child].contains || 1
        child = packageStructure[child].child
      }

      // Nếu child là base unit, không cần nhân thêm
      if (child === baseUnit) {
        // multiplier đã đúng
      }

      unitMultipliers[unitName] = multiplier
    }
  }

  // Xử lý từng unit trong array
  for (const unitItem of units) {
    const { unit, multiplier, price } = unitItem
    if (!unit || price === undefined || price === null) continue

    const normalizedUnit = unitNameMap[unit.toLowerCase()] || unit.toLowerCase()
    const unitPrice = Number(price) || 0

    // Nếu là base unit (multiplier = 1 hoặc unit name = base_unit)
    if (multiplier === 1 || normalizedUnit === baseUnit) {
      baseUnitPrice = unitPrice
      pricePerUnit[baseUnit] = unitPrice
    }
    // Xác định dựa vào multiplier và package_structure
    else {
      // Tìm unit trong package_structure có multiplier khớp
      let matchedUnit = null
      for (const [structUnit, structMultiplier] of Object.entries(unitMultipliers)) {
        if (structMultiplier === multiplier) {
          matchedUnit = structUnit
          break
        }
      }

      // Nếu tìm thấy unit trong package_structure
      if (matchedUnit) {
        pricePerUnit[matchedUnit] = unitPrice
      }
      // Fallback: sử dụng tên unit trực tiếp (nếu có trong package_structure)
      else if (packageStructure && packageStructure[normalizedUnit]) {
        pricePerUnit[normalizedUnit] = unitPrice
      }
      // Fallback cuối: sử dụng tên unit (backward compatibility)
      else {
        pricePerUnit[normalizedUnit] = unitPrice
      }
    }
  }

  // Đảm bảo base_unit_price được set
  if (baseUnitPrice === 0 && pricePerUnit[baseUnit]) {
    baseUnitPrice = pricePerUnit[baseUnit]
  }

  return {
    base_unit_price: baseUnitPrice,
    price_per_unit: pricePerUnit,
  }
}

// Tạo mới 1 thuốc
export const createMedicine = async (payload) => {
  // Validate barcode unique (nếu có)
  if (payload.barcode) {
    const existing = await medicinesRepo.findByBarcodeOrRegNumber(payload.barcode, null)
    if (existing) {
      throw new AppError(400, 'Mã vạch đã tồn tại')
    }
  }

  // Validate registration_number unique (nếu có)
  if (payload.registration_number) {
    const existing = await medicinesRepo.findByBarcodeOrRegNumber(null, payload.registration_number)
    if (existing) {
      throw new AppError(400, 'Số đăng ký đã tồn tại')
    }
  }

  // Chuyển đổi units array thành prices object nếu có
  const processedPayload = { ...payload }
  if (Array.isArray(payload.units) && payload.units.length > 0) {
    processedPayload.prices = convertUnitsToPrices(
      payload.units,
      payload.base_unit || 'tablet',
      payload.package_structure
    )
    // Xóa units khỏi payload vì không lưu vào database
    delete processedPayload.units
  }

  const created = await medicinesRepo.create(processedPayload)
  return created
}

// Lấy chi tiết 1 thuốc theo id
export const getMedicineById = async (id) => {
  const medicine = await medicinesRepo.findById(id)
  if (!medicine) throw new AppError(404, 'Không tìm thấy thuốc')

  // Format medicine with all unit prices
  return formatMedicineWithPrices(medicine)
}

// Lấy danh sách thuốc (kèm phân trang, search, filter)
export const getMedicines = async (query = {}) => {
  const { page, limit, sort, search, name, q, category_id, status } = query

  const filter = {}
  if (category_id) filter.category_id = category_id
  if (status) filter.status = status

  const options = { page: Number(page) || 1, limit: Number(limit) || 10 }

  // Nhận sort dạng JSON string từ query: {"createdAt":-1}
  if (sort) {
    try {
      options.sort = JSON.parse(sort)
    } catch {
      options.sort = { createdAt: -1 }
    }
  }

  // Ưu tiên tìm kiếm theo tên (name hoặc q)
  if (name || q) {
    options.name = name || q
  } else if (search) {
    options.search = search
  }

  return await medicinesRepo.findAll(filter, options)
}

// Cập nhật 1 thuốc
export const updateMedicine = async (id, payload) => {
  // Validate barcode unique (nếu update)
  if (payload.barcode) {
    const existing = await medicinesRepo.findByBarcodeOrRegNumber(payload.barcode, null)
    if (existing && existing._id.toString() !== id) {
      throw new AppError(400, 'Mã vạch đã tồn tại')
    }
  }

  // Validate registration_number unique (nếu update)
  if (payload.registration_number) {
    const existing = await medicinesRepo.findByBarcodeOrRegNumber(null, payload.registration_number)
    if (existing && existing._id.toString() !== id) {
      throw new AppError(400, 'Số đăng ký đã tồn tại')
    }
  }

  // Lấy thông tin thuốc hiện tại để có base_unit và package_structure nếu không có trong payload
  const currentMedicine = await medicinesRepo.findById(id)
  if (!currentMedicine) throw new AppError(404, 'Không tìm thấy thuốc')

  // Chuyển đổi units array thành prices object nếu có
  const processedPayload = { ...payload }
  if (Array.isArray(payload.units) && payload.units.length > 0) {
    processedPayload.prices = convertUnitsToPrices(
      payload.units,
      payload.base_unit || currentMedicine.base_unit || 'tablet',
      payload.package_structure || currentMedicine.package_structure
    )
    // Xóa units khỏi payload vì không lưu vào database
    delete processedPayload.units
  }

  const updated = await medicinesRepo.updateById(id, processedPayload)
  if (!updated) throw new AppError(404, 'Không tìm thấy thuốc')
  return updated
}

// Xóa 1 thuốc
export const deleteMedicine = async (id) => {
  const deleted = await medicinesRepo.deleteById(id)
  if (!deleted) throw new AppError(404, 'Không tìm thấy thuốc')
  return deleted
}

// Lấy danh sách thuốc theo category
export const getMedicinesByCategory = async (categoryId, query = {}) => {
  if (!categoryId) {
    throw new AppError(400, 'Category ID là bắt buộc')
  }

  const { page, limit, sort, search, name, q, status } = query
  const filter = { status: status || 'active' }

  const options = { page: Number(page) || 1, limit: Number(limit) || 10 }

  if (sort) {
    try {
      options.sort = JSON.parse(sort)
    } catch {
      options.sort = { createdAt: -1 }
    }
  }

  if (name || q) {
    options.name = name || q
  } else if (search) {
    options.search = search
  }

  return await medicinesRepo.findByCategory(categoryId, filter, options)
}

// Lấy danh sách thuốc theo status
export const getMedicinesByStatus = async (status, query = {}) => {
  if (!status) {
    throw new AppError(400, 'Status là bắt buộc')
  }

  const { page, limit, sort, search, name, q, category_id } = query
  const filter = { category_id: category_id || undefined }

  const options = { page: Number(page) || 1, limit: Number(limit) || 10 }

  if (sort) {
    try {
      options.sort = JSON.parse(sort)
    } catch {
      options.sort = { createdAt: -1 }
    }
  }

  if (name || q) {
    options.name = name || q
  } else if (search) {
    options.search = search
  }

  return await medicinesRepo.findByStatus(status, filter, options)
}

// Lấy danh sách thuốc cần nhập hàng (dưới threshold)
export const getLowStockMedicines = async (query = {}) => {
  const { page, limit, sort } = query
  const options = { page: Number(page) || 1, limit: Number(limit) || 10 }

  if (sort) {
    try {
      options.sort = JSON.parse(sort)
    } catch {
      options.sort = { alert_threshold: 1 }
    }
  }

  return await medicinesRepo.findLowStockMedicines({}, options)
}

// Lấy danh sách thuốc theo chi nhánh (kèm thông tin tồn kho và lô hàng)
export const getMedicinesByBranch = async (branchId, query = {}) => {
  if (!branchId) {
    throw new AppError(400, 'Chi nhánh là bắt buộc')
  }

  const { page, limit, sort, search, name, q, status } = query
  const options = { page: Number(page) || 1, limit: Number(limit) || 10 }

  if (sort) {
    try {
      options.sort = JSON.parse(sort)
    } catch {
      options.sort = { createdAt: -1 }
    }
  }

  if (name || q) {
    options.name = name || q
  } else if (search) {
    options.search = search
  }

  if (status) options.status = status

  return await medicinesRepo.getMedicinesByBranchWithBatches(branchId, options)
}

// Kiểm tra tồn kho 1 thuốc tại tất cả cửa hàng
export const getInventoryAllBranches = async (medicineId, query = {}) => {
  if (!medicineId) {
    throw new AppError(400, 'ID thuốc là bắt buộc')
  }

  // Kiểm tra thuốc có tồn tại không
  const medicine = await medicinesRepo.findById(medicineId)
  if (!medicine) {
    throw new AppError(404, 'Không tìm thấy thuốc')
  }

  const { sortBy = 'branch_name' } = query

  const result = await medicinesRepo.getInventoryAllBranches(medicineId, sortBy)

  return {
    data: {
      medicine_id: medicine._id,
      medicine_name: medicine.name,
      generic_name: medicine.generic_name,
      brand_name: medicine.brand_name,
      unit: medicine.unit,
      retail_price: medicine.retail_price,
      alert_threshold: medicine.alert_threshold,
      branches: result,
      total_quantity: result.reduce((sum, b) => sum + b.total_quantity, 0),
    },
  }
}
