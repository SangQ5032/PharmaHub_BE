// - Không làm việc trực tiếp với Express (req/res)
// - Không viết truy vấn Mongoose trực tiếp (ủy quyền cho repository)
import medicinesRepo from './medicines.repository.js'
import { AppError } from '../../utils/AppError.js'

// Tạo mới 1 thuốc
export const createMedicine = async (payload) => {
  const created = await medicinesRepo.create(payload)
  return created
}

// Lấy chi tiết 1 thuốc theo id
export const getMedicineById = async (id) => {
  const medicine = await medicinesRepo.findById(id)
  if (!medicine) throw new AppError(404, 'Medicine not found')
  return medicine
}

// Lấy danh sách thuốc (kèm phân trang, search, filter, tìm kiếm theo tên)
export const getMedicines = async (query = {}) => {
  const { page, limit, sort, search, name, q, category, supplier_id } = query

  const filter = {}
  if (category) filter.category = category
  if (supplier_id) filter.supplier_id = supplier_id

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
  // VD: GET /api/medicines?name=thuốc hoặc GET /api/medicines?q=thuốc
  if (name || q) {
    options.name = name || q
  } else if (search) {
    // Nếu không có name/q thì dùng text search
    options.search = search
  }

  return await medicinesRepo.findAll(filter, options)
}

// Cập nhật 1 thuốc
export const updateMedicine = async (id, payload) => {
  const updated = await medicinesRepo.updateById(id, payload)
  if (!updated) throw new AppError(404, 'Medicine not found')
  return updated
}

// Xóa 1 thuốc
export const deleteMedicine = async (id) => {
  const deleted = await medicinesRepo.deleteById(id)
  if (!deleted) throw new AppError(404, 'Medicine not found')
  return deleted
}
