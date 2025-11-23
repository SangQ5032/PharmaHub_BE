// MODULE: CATEGORIES - REPOSITORY (Data Access Layer)
import { Category } from './categories.model.js'

class CategoriesRepository {
  // Tạo mới 1 danh mục
  async create(categoryData) {
    return await Category.create(categoryData)
  }

  // Tìm 1 danh mục theo id
  async findById(id) {
    return await Category.findById(id).lean()
  }

  // Lấy danh sách danh mục
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, search, name } = options

    const mongoFilter = { ...filter }

    // Tìm kiếm theo tên
    if (name) {
      mongoFilter.name = { $regex: name, $options: 'i' }
    }

    // Tìm kiếm toàn văn
    if (search && !name) {
      mongoFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      Category.find(mongoFilter).sort(sort).skip(skip).limit(limit).lean(),
      Category.countDocuments(mongoFilter),
    ])

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Cập nhật 1 danh mục
  async updateById(id, update) {
    return await Category.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean()
  }

  // Xóa 1 danh mục
  async deleteById(id) {
    return await Category.findByIdAndDelete(id).lean()
  }

  // Lấy danh mục theo status
  async findByStatus(status, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      Category.find({ status }).sort(sort).skip(skip).limit(limit).lean(),
      Category.countDocuments({ status }),
    ])

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // Lấy tất cả danh mục (không phân trang) - dùng cho dropdown
  async findAllActive() {
    return await Category.find({ status: 'active' }).sort({ name: 1 }).lean()
  }
}

export default new CategoriesRepository()
