import { Import } from './imports.model.js'
import { Inventory } from '../inventory/inventory.model.js'
import { Medicine } from '../medicines/medicines.model.js'
import { Supplier } from '../suppliers/suppliers.model.js'
import mongoose from 'mongoose'

class ImportRepository {
  /**
   * Tạo phiếu nhập hàng mới
   * @param {Object} importData - Dữ liệu phiếu nhập
   * @returns {Promise<Object>} - Phiếu nhập đã tạo
   */
  async create(importData) {
    const importRecord = await Import.create(importData)
    return importRecord
  }

  /**
   * Tìm phiếu nhập theo ID
   * @param {String} id - ID phiếu nhập
   * @returns {Promise<Object>} - Phiếu nhập
   */
  async findById(id) {
    return await Import.findById(id)
      .populate('branch_id', 'name address phone')
      .populate('supplier_id', 'name contact')
      .populate('employee_id', 'username fullName')
      .populate('items.medicine_id', 'name unit price')
      .lean()
  }

  /**
   * Lấy danh sách phiếu nhập với filter
   * @param {Object} filter - Điều kiện lọc
   * @param {Object} options - Tùy chọn phân trang
   * @returns {Promise<Array>} - Danh sách phiếu nhập
   */
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options

    const skip = (page - 1) * limit

    const imports = await Import.find(filter)
      .populate('branch_id', 'name address')
      .populate('supplier_id', 'name contact.phone')
      .populate('employee_id', 'username fullName')
      .populate('items.medicine_id', 'name unit')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Import.countDocuments(filter)

    return {
      data: imports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Cập nhật inventory sau khi nhập hàng
   * @param {String} branchId - ID chi nhánh
   * @param {Array} items - Danh sách thuốc nhập
   * @returns {Promise<void>}
   */
  async updateInventory(branchId, items) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      for (const item of items) {
        // Tìm hoặc tạo mới inventory record
        let inventory = await Inventory.findOne({
          branch_id: branchId,
          medicine_id: item.medicine_id,
        }).session(session)

        if (inventory) {
          // Cập nhật số lượng tồn kho
          inventory.quantity += item.quantity
          inventory.last_updated = new Date()
          await inventory.save({ session })
        } else {
          // Tạo mới inventory record
          await Inventory.create(
            [
              {
                branch_id: branchId,
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                last_updated: new Date(),
              },
            ],
            { session }
          )
        }
      }

      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  /**
   * Kiểm tra tồn tại của medicine, supplier, branch
   * @param {Array} medicineIds - Danh sách ID thuốc
   * @param {String} supplierId - ID nhà cung cấp
   * @returns {Promise<Object>} - Kết quả kiểm tra
   */
  async validateReferences(medicineIds, supplierId) {
    const medicines = await Medicine.find({
      _id: { $in: medicineIds },
    }).lean()

    const supplier = await Supplier.findById(supplierId).lean()

    return {
      medicines,
      supplier,
    }
  }

  /**
   * Lấy thống kê nhập hàng theo chi nhánh
   * @param {String} branchId - ID chi nhánh
   * @param {Object} dateRange - Khoảng thời gian
   * @returns {Promise<Object>} - Thống kê
   */
  async getImportStatsByBranch(branchId, dateRange = {}) {
    const { from, to } = dateRange
    const filter = { branch_id: branchId }

    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to) filter.createdAt.$lte = new Date(to)
    }

    const stats = await Import.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalImports: { $sum: 1 },
          totalCost: { $sum: '$total_cost' },
          avgCost: { $avg: '$total_cost' },
        },
      },
    ])

    return stats[0] || { totalImports: 0, totalCost: 0, avgCost: 0 }
  }
}

export default new ImportRepository()

