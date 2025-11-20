// MODULE: MEDICINES - REPOSITORY (Data Access Layer)
// Mục đích: Làm việc trực tiếp với MongoDB thông qua Mongoose
// - Chỉ chứa các hàm CRUD/Query, không xử lý nghiệp vụ
import mongoose from 'mongoose'
import { Medicine } from './medicines.model.js'
import { Inventory } from '../inventory/inventory.model.js'

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
    // Bật runValidators để đảm bảo các ràng buộc schema được kiểm tra khi update
    return await Medicine.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean()
  }

  // Xóa 1 thuốc theo id
  async deleteById(id) {
    return await Medicine.findByIdAndDelete(id).lean()
  }

  // Lấy danh sách thuốc theo chi nhánh (với tồn kho)
  // Trả về tất cả thuốc, nhưng kèm thông tin tồn kho ở chi nhánh đó
  // Nếu không có tồn kho trong chi nhánh thì sẽ có trường "in_stock": false
  async findByBranch(branchId, filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, search, name } = options

    // Convert branchId từ string sang ObjectId
    const branchObjectId = new mongoose.Types.ObjectId(branchId)

    const skip = (page - 1) * limit

    // Pipeline aggregation để join medicines với inventory theo branch
    const pipeline = [
      // 1. Khớp tất cả thuốc
      { $match: {} },

      // 2. Lookup inventory theo branch_id và medicine_id
      {
        $lookup: {
          from: 'inventory',
          let: { medicine_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$medicine_id', '$$medicine_id'] },
                    { $eq: ['$branch_id', branchObjectId] },
                  ],
                },
              },
            },
          ],
          as: 'inventory',
        },
      },

      // 3. Thêm các trường mới
      {
        $addFields: {
          // Lấy phần tử đầu tiên của mảng inventory (nếu tồn tại)
          inventory_record: { $arrayElemAt: ['$inventory', 0] },
          // Thêm trường xác định có tồn kho trong chi nhánh không
          // FIX: Phải dùng $ifNull để xử lý trường hợp inventory_record là null
          in_stock: {
            $gte: [{ $ifNull: [{ $arrayElemAt: ['$inventory.quantity', 0] }, 0] }, 1],
          },
          // Số lượng tồn kho (nếu không có thì mặc định 0)
          quantity: {
            $ifNull: [{ $arrayElemAt: ['$inventory.quantity', 0] }, 0],
          },
          // Ngày cập nhật cuối cùng
          last_updated: {
            $arrayElemAt: ['$inventory.last_updated', 0],
          },
        },
      },

      // 4. Loại bỏ trường inventory_record thừa
      {
        $project: {
          inventory: 0,
        },
      },
    ]

    // Thêm filter tên nếu có
    if (name) {
      pipeline.push({
        $match: {
          name: { $regex: name, $options: 'i' },
        },
      })
    }

    // Thêm filter search nếu có
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
          ],
        },
      })
    }

    // Thêm filter khác (category, supplier_id, ...)
    const mongoFilter = { ...filter }
    if (Object.keys(mongoFilter).length > 0) {
      pipeline.push({ $match: mongoFilter })
    }

    // Đếm tổng trước khi phân trang
    const countPipeline = [...pipeline, { $count: 'total' }]
    const countResult = await Medicine.aggregate(countPipeline)
    const total = countResult.length > 0 ? countResult[0].total : 0

    // Thêm sort
    pipeline.push({ $sort: sort })

    // Thêm phân trang
    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: limit })

    const data = await Medicine.aggregate(pipeline)

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
