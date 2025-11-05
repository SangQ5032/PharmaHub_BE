import inventoryRepository from './inventory.repository.js'
import { AppError } from '../../utils/AppError.js'

class InventoryService {
  /**
   * Lấy tồn kho theo chi nhánh
   * @param {String} branchId - ID chi nhánh
   * @param {Object} query - Query parameters
   * @returns {Promise<Array>} - Danh sách tồn kho
   */
  async getInventoryByBranch(branchId, query = {}) {
    // Validate branchId
    if (!branchId) {
      throw new AppError(400, 'ID chi nhánh là bắt buộc')
    }

    // Kiểm tra branch tồn tại
    const branch = await inventoryRepository.validateBranch(branchId)
    if (!branch) {
      throw new AppError(404, 'Chi nhánh không tồn tại')
    }

    const { medicine_id, low_stock } = query

    // Nếu yêu cầu low_stock
    if (low_stock === 'true') {
      const inventory = await inventoryRepository.getLowStock(branchId)
      return inventory
    }

    // Build filter
    const filter = {}
    if (medicine_id) {
      // Validate medicine tồn tại
      const medicine = await inventoryRepository.validateMedicine(medicine_id)
      if (!medicine) {
        throw new AppError(404, 'Thuốc không tồn tại')
      }
      filter.medicine_id = medicine_id
    }

    const inventory = await inventoryRepository.getByBranch(branchId, filter)

    // Transform data để thêm status
    const result = inventory.map((item) => {
      const status =
        item.quantity === 0
          ? 'out_of_stock'
          : item.quantity <= item.medicine_id.warning_threshold
            ? 'low_stock'
            : 'sufficient'

      return {
        _id: item._id,
        branch_id: item.branch_id,
        medicine_id: item.medicine_id._id,
        medicine_name: item.medicine_id.name,
        medicine_unit: item.medicine_id.unit,
        medicine_category: item.medicine_id.category,
        quantity: item.quantity,
        warning_threshold: item.medicine_id.warning_threshold,
        status,
        last_updated: item.last_updated,
      }
    })

    return result
  }

  /**
   * Lấy tồn kho toàn hệ thống (admin only)
   * @param {Object} query - Query parameters
   * @returns {Promise<Array>} - Danh sách tồn kho
   */
  async getAllInventory(query = {}) {
    const { branch_id, medicine_id, low_stock } = query

    // Nếu yêu cầu low_stock
    if (low_stock === 'true') {
      const inventory = await inventoryRepository.getLowStock(branch_id || null)
      return inventory
    }

    // Build filter
    const filter = {}

    if (branch_id) {
      // Validate branch tồn tại
      const branch = await inventoryRepository.validateBranch(branch_id)
      if (!branch) {
        throw new AppError(404, 'Chi nhánh không tồn tại')
      }
      filter.branch_id = branch_id
    }

    if (medicine_id) {
      // Validate medicine tồn tại
      const medicine = await inventoryRepository.validateMedicine(medicine_id)
      if (!medicine) {
        throw new AppError(404, 'Thuốc không tồn tại')
      }
      filter.medicine_id = medicine_id
    }

    const inventory = await inventoryRepository.getAll(filter)

    // Transform data để thêm status
    const result = inventory.map((item) => {
      const status =
        item.quantity === 0
          ? 'out_of_stock'
          : item.quantity <= item.medicine_id.warning_threshold
            ? 'low_stock'
            : 'sufficient'

      return {
        _id: item._id,
        branch_id: item.branch_id,
        branch_name: item.branch_id.name,
        branch_address: item.branch_id.address,
        medicine_id: item.medicine_id._id,
        medicine_name: item.medicine_id.name,
        medicine_unit: item.medicine_id.unit,
        medicine_category: item.medicine_id.category,
        quantity: item.quantity,
        warning_threshold: item.medicine_id.warning_threshold,
        status,
        last_updated: item.last_updated,
      }
    })

    return result
  }
}

export default new InventoryService()
