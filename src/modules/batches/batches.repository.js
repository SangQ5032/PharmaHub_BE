// MODULE: BATCHES - REPOSITORY (Data Access Layer)
// Mục đích: Làm việc trực tiếp với MongoDB thông qua Mongoose
import mongoose from 'mongoose'
import { Batch } from './batches.model.js'

class BatchesRepository {
  // Tạo mới 1 lô hàng
  async create(batchData) {
    return await Batch.create(batchData)
  }

  // Tìm 1 lô hàng theo id
  async findById(id) {
    return await Batch.findById(id)
      .populate({
        path: 'medicine_id',
        select: 'name generic_name brand_name unit category_id retail_price units base_unit',
        populate: [
          {
            path: 'units',
            select: 'name short_name ratio_to_base',
          },
          {
            path: 'base_unit',
            select: 'name short_name ratio_to_base',
          },
        ],
      })
      .populate('branch_id', 'name address')
      .populate('supplier_id', 'name')
      .lean()
  }

  // Tìm tất cả lô hàng của chi nhánh
  async findByBranchId(branchId, options = {}) {
    const branchObjectId = new mongoose.Types.ObjectId(branchId)
    const { page = 1, limit = 100, sort = { createdAt: -1 } } = options

    const skip = (page - 1) * limit

    const mongoFilter = { branch_id: branchObjectId, status: 'active' }

    const [data, total] = await Promise.all([
      Batch.find(mongoFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'medicine_id',
          select: 'name generic_name brand_name unit category_id retail_price units base_unit',
          populate: [
            {
              path: 'units',
              select: 'name short_name ratio_to_base',
            },
            {
              path: 'base_unit',
              select: 'name short_name ratio_to_base',
            },
          ],
        })
        .populate('supplier_id', 'name')
        .lean(),
      Batch.countDocuments(mongoFilter),
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

  // Tìm tất cả lô hàng của chi nhánh theo thuốc
  async findByBranchAndMedicine(branchId, medicineId) {
    const branchObjectId = new mongoose.Types.ObjectId(branchId)
    const medicineObjectId = new mongoose.Types.ObjectId(medicineId)

    return await Batch.find({
      branch_id: branchObjectId,
      medicine_id: medicineObjectId,
      status: 'active',
    })
      .populate({
        path: 'medicine_id',
        select: 'name generic_name brand_name unit category_id retail_price units base_unit',
        populate: [
          {
            path: 'units',
            select: 'name short_name ratio_to_base',
          },
          {
            path: 'base_unit',
            select: 'name short_name ratio_to_base',
          },
        ],
      })
      .populate('supplier_id', 'name')
      .sort({ expiry_date: 1 }) // Hiển thị lô sắp hết hạn trước
      .lean()
  }

  // Cập nhật lô hàng
  async updateById(id, update) {
    return await Batch.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate({
        path: 'medicine_id',
        select: 'name generic_name brand_name unit category_id retail_price units base_unit',
        populate: [
          {
            path: 'units',
            select: 'name short_name ratio_to_base',
          },
          {
            path: 'base_unit',
            select: 'name short_name ratio_to_base',
          },
        ],
      })
      .populate('supplier_id', 'name')
      .lean()
  }

  // Xóa lô hàng
  async deleteById(id) {
    return await Batch.findByIdAndDelete(id).lean()
  }

  // Tính tổng tồn kho của thuốc trong chi nhánh
  async getTotalQuantityByBranchAndMedicine(branchId, medicineId) {
    const branchObjectId = new mongoose.Types.ObjectId(branchId)
    const medicineObjectId = new mongoose.Types.ObjectId(medicineId)

    const result = await Batch.aggregate([
      {
        $match: {
          branch_id: branchObjectId,
          medicine_id: medicineObjectId,
          status: 'active',
        },
      },
      {
        $group: {
          _id: null,
          total_quantity: { $sum: '$quantity' }, // quantity luôn ở base unit
          batch_count: { $sum: 1 },
        },
      },
    ])

    return result[0] || { total_quantity: 0, batch_count: 0 }
  }

  // Lấy danh sách thuốc có tồn kho trong chi nhánh (kèm lô hàng chi tiết)
  async getMedicinesWithBatchesByBranch(branchId, options = {}) {
    const branchObjectId = new mongoose.Types.ObjectId(branchId)
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options

    const skip = (page - 1) * limit

    // Aggregate để lấy danh sách thuốc + lô hàng
    const [data, total] = await Promise.all([
      Batch.aggregate([
        {
          $match: {
            branch_id: branchObjectId,
            status: 'active',
          },
        },
        {
          $lookup: {
            from: 'medicines',
            localField: 'medicine_id',
            foreignField: '_id',
            as: 'medicine_info',
          },
        },
        {
          $unwind: '$medicine_info',
        },
        {
          $lookup: {
            from: 'suppliers',
            localField: 'supplier_id',
            foreignField: '_id',
            as: 'supplier_info',
          },
        },
        {
          $unwind: {
            path: '$supplier_info',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$medicine_id',
            medicine: { $first: '$medicine_info' },
            total_quantity: { $sum: '$quantity' }, // quantity luôn ở base unit
            batches: {
              $push: {
                _id: '$_id',
                batch_number: '$batch_number',
                expiry_date: '$expiry_date',
                import_price: '$import_price',
                quantity: '$quantity', // quantity luôn ở base unit
                quantity: '$quantity', // Legacy field for backward compatibility
                supplier_name: '$supplier_info.name',
                createdAt: '$createdAt',
              },
            },
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
      Batch.aggregate([
        {
          $match: {
            branch_id: branchObjectId,
            status: 'active',
          },
        },
        {
          $group: {
            _id: '$medicine_id',
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

export default new BatchesRepository()
