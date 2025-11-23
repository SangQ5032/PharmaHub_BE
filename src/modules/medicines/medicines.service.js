// MODULE: MEDICINES - SERVICE (Business Logic Layer)
// Mục đích: Xử lý logic nghiệp vụ
// - Không làm việc trực tiếp với Express (req/res)
// - Không viết truy vấn Mongoose trực tiếp (ủy quyền cho repository)
import medicinesRepo from './medicines.repository.js'
import { AppError } from '../../utils/AppError.js'

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

  const created = await medicinesRepo.create(payload)
  return created
}

// Lấy chi tiết 1 thuốc theo id
export const getMedicineById = async (id) => {
  const medicine = await medicinesRepo.findById(id)
  if (!medicine) throw new AppError(404, 'Không tìm thấy thuốc')
  return medicine
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

  const updated = await medicinesRepo.updateById(id, payload)
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
