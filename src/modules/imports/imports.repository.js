import { Import } from './imports.model.js'
import { Inventory } from '../inventory/inventory.model.js'
import { Medicine } from '../medicines/medicines.model.js'
import { Supplier } from '../suppliers/suppliers.model.js'
import { Batch } from '../batches/batches.model.js'
import { BranchInventory } from '../branch_inventory/branch_inventory.model.js'
import { StockMovement } from '../stock_movements/stock_movements.model.js'
import Branch from '../branch/branch.model.js'
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
      .populate('employee_id', 'username name')
      .populate('items.medicine_id', 'name unit')
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
      .populate('employee_id', 'username name')
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
   * Tạo batch records từ phiếu nhập
   * @param {String} branchId - ID chi nhánh
   * @param {String} importRecordId - ID phiếu nhập
   * @param {Array} items - Danh sách thuốc nhập (đã được process với medicine info)
   * @param {String} supplierId - ID nhà cung cấp
   * @param {String} userId - ID người thực hiện
   * @returns {Promise<Array>} - Danh sách batch tạo mới
   */
  async createBatchesFromImport(branchId, importRecordId, items, supplierId, userId) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const batches = []
      const batchIds = []

      // Lấy thông tin medicine để có base_unit
      const medicineIds = items.map((item) => item.medicine_id)
      const medicines = await Medicine.find({
        _id: { $in: medicineIds },
      })
        .select('base_unit')
        .session(session)
        .lean()

      const medicineMap = new Map(medicines.map((m) => [m._id.toString(), m]))

      for (const item of items) {
        const medicine = medicineMap.get(item.medicine_id.toString())
        if (!medicine) {
          throw new Error(`Không tìm thấy thuốc với ID: ${item.medicine_id}`)
        }

        // Tạo batch với đầy đủ thông tin
        const batch = await Batch.create(
          [
            {
              branch_id: branchId,
              medicine_id: item.medicine_id,
              supplier_id: supplierId,
              import_record_id: importRecordId,
              batch_code: item.batch_number, // batch_code trong model
              expiry_date: item.expiry_date,
              unit: medicine.base_unit, // Set unit từ medicine.base_unit
              quantity: item.quantity, // quantity luôn lưu ở base unit (đã convert)
              initial_quantity: item.quantity,
              import_price: item.unit_price, // unit_price đã được convert về base unit
              retail_price: item.retail_price_for_base_unit || item.unit_price, // retail_price cho base unit
              status: 'active',
            },
          ],
          { session }
        )

        const createdBatch = batch[0]
        batches.push(createdBatch)
        batchIds.push(createdBatch._id)

        // Cập nhật branch_inventory - thêm batch vào array
        let branchInventory = await BranchInventory.findOne({
          branch_id: branchId,
          medicine_id: item.medicine_id,
        }).session(session)

        if (branchInventory) {
          // Thêm batch_id vào array nếu chưa có
          if (!branchInventory.batches.includes(createdBatch._id)) {
            branchInventory.batches.push(createdBatch._id)
            await branchInventory.save({ session })
          }
        } else {
          // Tạo mới branch_inventory record
          await BranchInventory.create(
            [
              {
                branch_id: branchId,
                medicine_id: item.medicine_id,
                batches: [createdBatch._id],
              },
            ],
            { session }
          )
        }

        // Tạo stock movement record
        await StockMovement.create(
          [
            {
              type: 'import',
              branch_id: branchId,
              medicine_id: item.medicine_id,
              batch_id: createdBatch._id,
              quantity: item.quantity, // Số lượng dương (nhập vào)
              reference: importRecordId.toString(),
              note: `Nhập hàng - Mã lô: ${item.batch_number}`,
              user_id: userId,
            },
          ],
          { session }
        )
      }

      await session.commitTransaction()
      return batches
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
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

        const quantityToAdd = item.quantity // quantity từ processedItems đã được convert về base unit

        if (inventory) {
          // Cập nhật số lượng tồn kho (quantity luôn ở base unit)
          inventory.quantity = (inventory.quantity || 0) + quantityToAdd
          inventory.last_updated = new Date()
          await inventory.save({ session })
        } else {
          // Tạo mới inventory record
          await Inventory.create(
            [
              {
                branch_id: branchId,
                medicine_id: item.medicine_id,
                quantity: quantityToAdd,
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
   * Rollback inventory khi hủy phiếu nhập
   * @param {String} branchId - ID chi nhánh
   * @param {Array} items - Danh sách thuốc nhập
   * @returns {Promise<void>}
   */
  async rollbackInventory(branchId, items) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      for (const item of items) {
        const inventory = await Inventory.findOne({
          branch_id: branchId,
          medicine_id: item.medicine_id,
        }).session(session)

        if (inventory) {
          inventory.quantity -= item.quantity
          if (inventory.quantity < 0) {
            inventory.quantity = 0
          }
          inventory.last_updated = new Date()
          await inventory.save({ session })
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
   * @param {String} branchId - ID chi nhánh
   * @returns {Promise<Object>} - Kết quả kiểm tra
   */
  async validateReferences(medicineIds, supplierId, branchId) {
    const medicines = await Medicine.find({
      _id: { $in: medicineIds },
    })
      .populate('base_unit', 'name short_name ratio_to_base')
      .populate('units', 'name short_name ratio_to_base')
      .lean()

    const supplier = await Supplier.findById(supplierId).lean()
    const branch = await Branch.findById(branchId).lean()

    return {
      medicines,
      supplier,
      branch,
    }
  }

  /**
   * Cập nhật trạng thái phiếu nhập
   * @param {String} id - ID phiếu nhập
   * @param {String} status - Trạng thái mới
   * @param {Object} additionalData - Dữ liệu thêm (nếu có)
   * @returns {Promise<Object>} - Phiếu nhập đã cập nhật
   */
  async updateStatus(id, status, additionalData = {}) {
    const updateData = { status, ...additionalData }
    const updated = await Import.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('branch_id', 'name address phone')
      .populate('supplier_id', 'name contact')
      .populate('employee_id', 'username name')
      .populate('items.medicine_id', 'name unit')
      .lean()

    return updated
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
          totalItems: { $sum: { $size: '$items' } },
        },
      },
    ])

    return stats[0] || { totalImports: 0, totalCost: 0, avgCost: 0, totalItems: 0 }
  }

  /**
   * Lấy danh sách batch theo import record
   * @param {String} importRecordId - ID phiếu nhập
   * @returns {Promise<Array>} - Danh sách batch
   */
  async getBatchesByImportRecord(importRecordId) {
    return await Batch.find({ import_record_id: importRecordId })
      .populate('medicine_id', 'name')
      .populate('branch_id', 'name')
      .lean()
  }
}

export default new ImportRepository()
