// MODULE: CATEGORIES - SERVICE (Business Logic Layer)
import categoriesRepo from './categories.repository.js'
import { AppError } from '../../utils/AppError.js'

// Tạo mới 1 danh mục
export const createCategory = async (payload) => {
  // Check duplicate name
  const existing = await categoriesRepo.findAll({ name: payload.name }, { limit: 1 })
  if (existing.data.length > 0) {
    throw new AppError(400, 'Tên danh mục đã tồn tại')
  }

  const created = await categoriesRepo.create(payload)
  return created
}

// Lấy chi tiết 1 danh mục
export const getCategoryById = async (id) => {
  const category = await categoriesRepo.findById(id)
  if (!category) throw new AppError(404, 'Không tìm thấy danh mục')
  return category
}

// Lấy danh sách danh mục
export const getCategories = async (query = {}) => {
  const { page, limit, sort, search, name, status } = query

  const filter = {}
  if (status) filter.status = status

  const options = { page: Number(page) || 1, limit: Number(limit) || 10 }

  if (sort) {
    try {
      options.sort = JSON.parse(sort)
    } catch {
      options.sort = { createdAt: -1 }
    }
  }

  if (name) {
    options.name = name
  } else if (search) {
    options.search = search
  }

  return await categoriesRepo.findAll(filter, options)
}

// Cập nhật 1 danh mục
export const updateCategory = async (id, payload) => {
  // Check duplicate name (nếu update)
  if (payload.name) {
    const existing = await categoriesRepo.findAll({ name: payload.name }, { limit: 1 })
    if (existing.data.length > 0 && existing.data[0]._id.toString() !== id) {
      throw new AppError(400, 'Tên danh mục đã tồn tại')
    }
  }

  const updated = await categoriesRepo.updateById(id, payload)
  if (!updated) throw new AppError(404, 'Không tìm thấy danh mục')
  return updated
}

// Xóa 1 danh mục
export const deleteCategory = async (id) => {
  const deleted = await categoriesRepo.deleteById(id)
  if (!deleted) throw new AppError(404, 'Không tìm thấy danh mục')
  return deleted
}

// Lấy danh mục theo status
export const getCategoriesByStatus = async (status, query = {}) => {
  const { page, limit, sort } = query

  const options = { page: Number(page) || 1, limit: Number(limit) || 10 }

  if (sort) {
    try {
      options.sort = JSON.parse(sort)
    } catch {
      options.sort = { createdAt: -1 }
    }
  }

  return await categoriesRepo.findByStatus(status, options)
}

// Lấy tất cả danh mục active (dùng cho dropdown)
export const getActiveCategoriesForDropdown = async () => {
  return await categoriesRepo.findAllActive()
}
