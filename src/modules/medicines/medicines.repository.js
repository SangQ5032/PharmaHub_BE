// MODULE: MEDICINES - REPOSITORY (Data Access Layer)
// Mục đích: Làm việc trực tiếp với MongoDB thông qua Mongoose
// - Chỉ chứa các hàm CRUD/Query, không xử lý nghiệp vụ
import { Medicine } from './medicines.model.js'

class MedicinesRepository {
  // Tạo mới 1 bản ghi thuốc
  async create(medicineData) {
    return await Medicine.create(medicineData)
  }

  // Tìm 1 thuốc theo id
  async findById(id) {
    return await Medicine.findById(id).lean()
  }

  // Lấy danh sách thuốc (có phân trang, sort, tìm kiếm text, tìm kiếm theo tên)
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, search, name } = options

    const mongoFilter = { ...filter }

    // Tìm kiếm theo tên thuốc (gần đúng, không phân biệt hoa thường)
    // VD: nhập "thuốc" sẽ tìm được "Thuốc 1", "thuốc cảm", "THUỐC ABC"
    if (name) {
      mongoFilter.name = { $regex: name, $options: 'i' } // 'i' = case-insensitive
    }

    // Tìm kiếm toàn văn theo name/description (dựa trên text index)
    // Chỉ dùng nếu không có name search (để tránh conflict)
    if (search && !name) {
      mongoFilter.$text = { $search: search }
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      Medicine.find(mongoFilter).sort(sort).skip(skip).limit(limit).lean(),
      Medicine.countDocuments(mongoFilter),
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

  // Cập nhật 1 thuốc theo id
  async updateById(id, update) {
    return await Medicine.findByIdAndUpdate(id, update, { new: true }).lean()
  }

  // Xóa 1 thuốc theo id
  async deleteById(id) {
    return await Medicine.findByIdAndDelete(id).lean()
  }
}

export default new MedicinesRepository()
