// MODULE: MEDICINES - REPOSITORY (Data Access Layer)
// Mục đích: Làm việc trực tiếp với MongoDB thông qua Mongoose
// - Chỉ chứa các hàm CRUD/Query, không xử lý nghiệp vụ
import mongoose from 'mongoose'
import { Medicine } from './medicines.model.js'

class MedicinesRepository {
  // Tạo mới 1 bản ghi thuốc
  async create(medicineData) {
    return await Medicine.create(medicineData)
  }

  // Tìm 1 thuốc theo id
  async findById(id) {
    return await Medicine.findById(id).populate('category_id', 'name description').lean()
  }

  // Lấy danh sách thuốc (có phân trang, sort, tìm kiếm)
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, search, name } = options

    const mongoFilter = { ...filter }

    // Tìm kiếm theo tên thuốc (gần đúng, không phân biệt hoa thường)
    if (name) {
      mongoFilter.name = { $regex: name, $options: 'i' }
    }

    // Tìm kiếm toàn văn theo multiple fields
    if (search && !name) {
      mongoFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { generic_name: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { registration_number: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      Medicine.find(mongoFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category_id', 'name description')
        .lean(),
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
    return await Medicine.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate('category_id', 'name description')
      .lean()
  }

  // Xóa 1 thuốc theo id
  async deleteById(id) {
    return await Medicine.findByIdAndDelete(id).lean()
  }

  // Tìm thuốc theo category_id
  async findByCategory(categoryId, filter = {}, options = {}) {
    const categoryObjectId = new mongoose.Types.ObjectId(categoryId)
    const mongoFilter = { ...filter, category_id: categoryObjectId }
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      Medicine.find(mongoFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category_id', 'name description')
        .lean(),
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

  // Tìm thuốc theo status
  async findByStatus(status, filter = {}, options = {}) {
    const mongoFilter = { ...filter, status }
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      Medicine.find(mongoFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category_id', 'name description')
        .lean(),
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

  // Tìm thuốc theo barcode hoặc registration_number
  async findByBarcodeOrRegNumber(barcode, regNumber) {
    return await Medicine.findOne({
      $or: [{ barcode }, { registration_number: regNumber }],
    })
      .populate('category_id', 'name description')
      .lean()
  }

  // Lấy danh sách thuốc cần nhập hàng (dưới threshold)
  async findLowStockMedicines(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { alert_threshold: 1 } } = options
    const skip = (page - 1) * limit

    const mongoFilter = {
      ...filter,
      status: 'active',
    }

    const [data, total] = await Promise.all([
      Medicine.find(mongoFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category_id', 'name description')
        .lean(),
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
}

export default new MedicinesRepository()
