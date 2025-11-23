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

  // Lấy danh sách thuốc theo chi nhánh (kèm thông tin tồn kho và lô hàng)
  async getMedicinesByBranchWithBatches(branchId, options = {}) {
    const branchObjectId = new mongoose.Types.ObjectId(branchId)
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      search,
      name,
      status = 'active',
    } = options

    const mongoSearchFilter = {}

    // Tìm kiếm theo tên
    if (name) {
      mongoSearchFilter.name = { $regex: name, $options: 'i' }
    }

    // Tìm kiếm toàn văn
    if (search && !name) {
      mongoSearchFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { generic_name: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ]
    }

    if (status) {
      mongoSearchFilter.status = status
    }

    const skip = (page - 1) * limit

    // Lấy danh sách thuốc + lô hàng từ chi nhánh
    const [data, total] = await Promise.all([
      Medicine.aggregate([
        {
          $match: mongoSearchFilter,
        },
        {
          $lookup: {
            from: 'batches',
            let: { medicine_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$medicine_id', '$$medicine_id'] },
                      { $eq: ['$branch_id', branchObjectId] },
                      { $eq: ['$status', 'active'] },
                    ],
                  },
                },
              },
              {
                $sort: { expiry_date: 1 },
              },
            ],
            as: 'batches',
          },
        },
        {
          $addFields: {
            total_quantity: { $sum: '$batches.quantity' },
            batch_count: { $size: '$batches' },
          },
        },
        // Chỉ lấy thuốc có tồn kho tại chi nhánh
        {
          $match: {
            batch_count: { $gt: 0 },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category_info',
          },
        },
        {
          $unwind: {
            path: '$category_info',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            generic_name: 1,
            brand_name: 1,
            dosage_form: 1,
            strength: 1,
            unit: 1,
            packaging: 1,
            category_id: 1,
            category_name: '$category_info.name',
            prescription_required: 1,
            is_controlled: 1,
            retail_price: 1,
            minimum_price: 1,
            max_price: 1,
            manufacturer: 1,
            country_of_origin: 1,
            barcode: 1,
            registration_number: 1,
            alert_threshold: 1,
            status: 1,
            total_quantity: 1,
            batch_count: 1,
            batches: {
              _id: 1,
              batch_number: 1,
              expiry_date: 1,
              import_price: 1,
              quantity: 1,
              supplier_id: 1,
              createdAt: 1,
            },
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $sort: sort,
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]),
      Medicine.aggregate([
        {
          $match: mongoSearchFilter,
        },
        {
          $lookup: {
            from: 'batches',
            let: { medicine_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$medicine_id', '$$medicine_id'] },
                      { $eq: ['$branch_id', branchObjectId] },
                      { $eq: ['$status', 'active'] },
                    ],
                  },
                },
              },
            ],
            as: 'batches',
          },
        },
        {
          $addFields: {
            batch_count: { $size: '$batches' },
          },
        },
        {
          $match: {
            batch_count: { $gt: 0 },
          },
        },
        {
          $count: 'total',
        },
      ]),
    ])

    const totalMedicines = total[0]?.total || 0

    return {
      data,
      pagination: {
        page,
        limit,
        total: totalMedicines,
        totalPages: Math.ceil(totalMedicines / limit),
      },
    }
  }
}

export default new MedicinesRepository()
