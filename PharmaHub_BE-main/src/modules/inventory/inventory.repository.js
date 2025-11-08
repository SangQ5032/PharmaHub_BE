import { Inventory } from './inventory.model.js'
import Branch from '../branch/branch.model.js'
import { Medicine } from '../medicines/medicines.model.js'

class InventoryRepository {
  /**
   * Lấy tồn kho theo chi nhánh
   * @param {String} branchId - ID chi nhánh
   * @param {Object} filter - Điều kiện lọc
   * @returns {Promise<Array>} - Danh sách tồn kho
   */
  async getByBranch(branchId, filter = {}) {
    const query = { branch_id: branchId, ...filter }

    const inventory = await Inventory.find(query)
      .populate('branch_id', 'name address phone')
      .populate(
        'medicine_id',
        'name description category unit price warning_threshold manufacturer'
      )
      .lean()

    return inventory
  }

  /**
   * Lấy tồn kho toàn hệ thống
   * @param {Object} filter - Điều kiện lọc
   * @returns {Promise<Array>} - Danh sách tồn kho
   */
  async getAll(filter = {}) {
    const inventory = await Inventory.find(filter)
      .populate('branch_id', 'name address phone')
      .populate(
        'medicine_id',
        'name description category unit price warning_threshold manufacturer'
      )
      .lean()

    return inventory
  }

  /**
   * Lấy tồn kho với filter low stock
   * @param {String} branchId - ID chi nhánh (optional)
   * @returns {Promise<Array>} - Danh sách thuốc sắp hết
   */
  async getLowStock(branchId = null) {
    // Aggregate để so sánh quantity với warning_threshold
    const matchStage = branchId ? { branch_id: branchId } : {}

    const inventory = await Inventory.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: '$medicine' },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch_id',
          foreignField: '_id',
          as: 'branch',
        },
      },
      { $unwind: '$branch' },
      {
        $addFields: {
          isLowStock: {
            $lte: ['$quantity', '$medicine.warning_threshold'],
          },
        },
      },
      { $match: { isLowStock: true } },
      {
        $project: {
          _id: 1,
          branch_id: 1,
          medicine_id: 1,
          quantity: 1,
          last_updated: 1,
          'branch.name': 1,
          'branch.address': 1,
          'medicine.name': 1,
          'medicine.unit': 1,
          'medicine.warning_threshold': 1,
          'medicine.category': 1,
        },
      },
    ])

    return inventory
  }

  /**
   * Kiểm tra tồn tại của branch
   * @param {String} branchId - ID chi nhánh
   * @returns {Promise<Object>} - Branch object
   */
  async validateBranch(branchId) {
    const branch = await Branch.findById(branchId).lean()
    return branch
  }

  /**
   * Kiểm tra tồn tại của medicine
   * @param {String} medicineId - ID thuốc
   * @returns {Promise<Object>} - Medicine object
   */
  async validateMedicine(medicineId) {
    const medicine = await Medicine.findById(medicineId).lean()
    return medicine
  }
}

export default new InventoryRepository()
