// MODULE: MEDICINES - REPOSITORY (Data Access Layer)
// Mục đích: Làm việc trực tiếp với MongoDB thông qua Mongoose
// - Chỉ chứa các hàm CRUD/Query, không xử lý nghiệp vụ
import mongoose from 'mongoose'
import { Medicine } from './medicines.model.js'
import { BranchInventory } from '../branch_inventory/branch_inventory.model.js'
import { Batch } from '../batches/batches.model.js'
import Branch from '../branch/branch.model.js'

class MedicinesRepository {
  // Helper: Lấy ratio từ unit_ratios (hỗ trợ cả Map và Object)
  _getUnitRatio(unit_ratios, unitIdStr) {
    if (!unit_ratios) return null
    // Nếu là Map
    if (unit_ratios instanceof Map) {
      return unit_ratios.get(unitIdStr)
    }
    // Nếu là Object (từ .lean())
    if (typeof unit_ratios === 'object' && unit_ratios !== null) {
      return unit_ratios[unitIdStr]
    }
    return null
  }

  // Helper: Override ratio_to_base từ unit_ratios
  _overrideUnitRatios(medicine) {
    if (!medicine || !medicine.unit_ratios || !medicine.units) {
      return medicine
    }

    medicine.units = medicine.units.map((unit) => {
      const unitIdStr = unit._id.toString()
      const customRatio = this._getUnitRatio(medicine.unit_ratios, unitIdStr)
      if (customRatio !== null && customRatio !== undefined) {
        return {
          ...unit,
          ratio_to_base: customRatio,
        }
      }
      return unit
    })

    return medicine
  }

  // Tạo mới 1 bản ghi thuốc
  async create(medicineData) {
    return await Medicine.create(medicineData)
  }

  // Tìm 1 thuốc theo id
  async findById(id) {
    const medicine = await Medicine.findById(id)
      .populate('base_unit', 'name short_name ratio_to_base')
      .populate('units', 'name short_name ratio_to_base')
      .lean()

    if (!medicine) return null

    return this._overrideUnitRatios(medicine)
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
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      Medicine.find(mongoFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('base_unit', 'name short_name ratio_to_base')
        .populate('units', 'name short_name ratio_to_base')
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
    const medicine = await Medicine.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate('base_unit', 'name short_name ratio_to_base')
      .populate('units', 'name short_name ratio_to_base')
      .lean()

    if (!medicine) return null

    return this._overrideUnitRatios(medicine)
  }

  // Xóa 1 thuốc theo id
  async deleteById(id) {
    return await Medicine.findByIdAndDelete(id).lean()
  }

  // Tìm thuốc theo tên
  async findByName(name) {
    const medicine = await Medicine.findOne({
      name: { $regex: name, $options: 'i' },
    })
      .populate('base_unit', 'name short_name ratio_to_base')
      .populate('units', 'name short_name ratio_to_base')
      .lean()

    if (!medicine) return null

    return this._overrideUnitRatios(medicine)
  }

  // Lấy danh sách thuốc đang hoạt động
  async findActiveMedicines(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options
    const skip = (page - 1) * limit

    const mongoFilter = {
      ...filter,
      is_active: true,
    }

    const [data, total] = await Promise.all([
      Medicine.find(mongoFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('base_unit', 'name short_name ratio_to_base')
        .populate('units', 'name short_name ratio_to_base')
        .lean(),
      Medicine.countDocuments(mongoFilter),
    ])

    // Override ratio_to_base từ unit_ratios nếu có
    const processedData = data.map((medicine) => this._overrideUnitRatios(medicine))

    return {
      data: processedData,
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
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    if (options.is_active !== undefined) {
      mongoSearchFilter.is_active = options.is_active === true || options.is_active === 'true'
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
                    $eq: ['$medicine_id', '$$medicine_id'],
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
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            image_url: 1,
            base_unit: 1,
            units: 1,
            is_active: 1,
            total_quantity: 1,
            batch_count: 1,
            batches: {
              _id: 1,
              batch_code: 1,
              expiry_date: 1,
              import_price: 1,
              retail_price: 1,
              quantity: 1,
              unit: 1,
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

  // Kiểm tra tồn kho 1 thuốc tại tất cả cửa hàng
  async getInventoryAllBranches(medicineId, sortBy = 'branch_name') {
    const medicineObjectId = new mongoose.Types.ObjectId(medicineId)

    // Định nghĩa các tùy chọn sắp xếp
    const sortOptions = {
      branch_name: { 'branch.name': 1 },
      total_quantity: { total_quantity: -1 },
      low_quantity: { total_quantity: 1 },
    }

    const sortStage = sortOptions[sortBy] || { 'branch.name': 1 }

    // Lấy tồn kho từ branch_inventory collection
    const inventories = await BranchInventory.find({ medicine_id: medicineObjectId })
      .populate('branch_id', 'name address phone')
      .lean()

    // Lấy tất cả batches của thuốc này
    const batches = await Batch.find({ medicine_id: medicineObjectId })
      .populate('unit', 'name short_name ratio_to_base')
      .populate('supplier_id', 'name')
      .lean()

    // Nhóm batches theo branch_id từ branch_inventory
    const result = inventories.map((inventory) => {
      const branchBatches = batches.filter((batch) => {
        return inventory.batches.some((b) => b.toString() === batch._id.toString())
      })

      const totalQuantity = branchBatches.reduce((sum, batch) => sum + (batch.quantity || 0), 0)

      return {
        branch_id: inventory.branch_id?._id || inventory.branch_id,
        branch_name: inventory.branch_id?.name || 'Không xác định',
        branch_address: inventory.branch_id?.address || '',
        branch_phone: inventory.branch_id?.phone || '',
        total_quantity: totalQuantity,
        batches: branchBatches.map((b) => ({
          _id: b._id,
          batch_code: b.batch_code,
          quantity: b.quantity,
          expiry_date: b.expiry_date,
          import_price: b.import_price,
          retail_price: b.retail_price,
          unit: b.unit,
          supplier_id: b.supplier_id,
        })),
        in_stock: totalQuantity > 0 ? 'Còn hàng' : 'Hết hàng',
      }
    })

    // Sắp xếp theo tùy chọn
    if (sortBy === 'total_quantity') {
      result.sort((a, b) => b.total_quantity - a.total_quantity)
    } else if (sortBy === 'low_quantity') {
      result.sort((a, b) => a.total_quantity - b.total_quantity)
    } else {
      result.sort((a, b) => (a.branch_name || '').localeCompare(b.branch_name || ''))
    }

    return result
  }
}

export default new MedicinesRepository()
