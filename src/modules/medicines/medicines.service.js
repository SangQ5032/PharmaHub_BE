// MODULE: MEDICINES - SERVICE (Business Logic Layer)
// Mục đích: Xử lý logic nghiệp vụ
// - Không làm việc trực tiếp với Express (req/res)
// - Không viết truy vấn Mongoose trực tiếp (ủy quyền cho repository)
import medicinesRepo from './medicines.repository.js'
import { AppError } from '../../utils/AppError.js'
import mongoose from 'mongoose'

// Tạo mới 1 thuốc
export const createMedicine = async (payload) => {
  // Validate base_unit là ObjectId hợp lệ
  if (!mongoose.Types.ObjectId.isValid(payload.base_unit)) {
    throw new AppError(400, 'Đơn vị cơ sở không hợp lệ')
  }

  // Validate units array (nếu có)
  if (payload.units && Array.isArray(payload.units)) {
    const invalidUnits = payload.units.filter((unitId) => !mongoose.Types.ObjectId.isValid(unitId))
    if (invalidUnits.length > 0) {
      throw new AppError(400, 'Một hoặc nhiều đơn vị không hợp lệ')
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
  const { page, limit, sort, search, name, q, is_active } = query

  const filter = {}
  if (is_active !== undefined) {
    filter.is_active = is_active === 'true' || is_active === true
  }

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
  // Validate base_unit là ObjectId hợp lệ (nếu có)
  if (payload.base_unit && !mongoose.Types.ObjectId.isValid(payload.base_unit)) {
    throw new AppError(400, 'Đơn vị cơ sở không hợp lệ')
  }

  // Validate units array (nếu có)
  if (payload.units && Array.isArray(payload.units)) {
    const invalidUnits = payload.units.filter((unitId) => !mongoose.Types.ObjectId.isValid(unitId))
    if (invalidUnits.length > 0) {
      throw new AppError(400, 'Một hoặc nhiều đơn vị không hợp lệ')
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

// Lấy danh sách thuốc đang hoạt động
export const getActiveMedicines = async (query = {}) => {
  const { page, limit, sort } = query
  const options = { page: Number(page) || 1, limit: Number(limit) || 10 }

  if (sort) {
    try {
      options.sort = JSON.parse(sort)
    } catch {
      options.sort = { createdAt: -1 }
    }
  }

  return await medicinesRepo.findActiveMedicines({}, options)
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
      description: medicine.description,
      base_unit: medicine.base_unit,
      units: medicine.units,
      branches: result,
      total_quantity: result.reduce((sum, b) => sum + b.total_quantity, 0),
    },
  }
}
