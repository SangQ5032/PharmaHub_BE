import crossBranchRepository from './cross-branch.repository.js'
import { AppError } from '../../utils/AppError.js'

class CrossBranchService {
  /**
   * Lấy tồn kho tất cả chi nhánh
   * @param {Object} query - Query parameters
   * @returns {Promise<Array>} - Danh sách tồn kho từ tất cả chi nhánh
   */
  async getAllBranchesInventory(query = {}) {
    const { medicine_id, branch_id, sort_by = 'desc' } = query

    // Build filter
    const filter = {}

    if (medicine_id) {
      // Validate medicine tồn tại
      const medicine = await crossBranchRepository.validateMedicine(medicine_id)
      if (!medicine) {
        throw new AppError(404, 'Thuốc không tồn tại')
      }
      filter.medicine_id = medicine_id
    }

    if (branch_id) {
      // Validate branch tồn tại
      const branch = await crossBranchRepository.validateBranch(branch_id)
      if (!branch) {
        throw new AppError(404, 'Chi nhánh không tồn tại')
      }
      filter.branch_id = branch_id
    }

    // Validate sort_by
    if (!['asc', 'desc'].includes(sort_by)) {
      throw new AppError(400, 'sort_by phải là asc hoặc desc')
    }

    const inventory = await crossBranchRepository.getAllBranchesInventory(filter, sort_by)

    // Transform data để thêm status
    const result = inventory.map((item) => {
      const status =
        item.quantity === 0
          ? 'out_of_stock'
          : item.quantity <= item.warning_threshold
            ? 'low_stock'
            : 'sufficient'

      return {
        _id: item._id,
        branch_id: item.branch_id,
        branch_name: item.branch_name,
        branch_address: item.branch_address,
        branch_phone: item.branch_phone,
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        medicine_unit: item.medicine_unit,
        medicine_category: item.medicine_category,
        quantity: item.quantity,
        warning_threshold: item.warning_threshold,
        status,
        last_updated: item.last_updated,
      }
    })

    return result
  }

  /**
   * So sánh tồn kho của 1 loại thuốc giữa các chi nhánh
   * @param {String} medicineId - ID thuốc
   * @returns {Promise<Object>} - Thông tin thuốc và tồn kho từ các chi nhánh
   */
  async compareMedicineAcrossBranches(medicineId) {
    // Validate medicineId
    if (!medicineId) {
      throw new AppError(400, 'ID thuốc là bắt buộc')
    }

    // Validate medicine tồn tại
    const medicine = await crossBranchRepository.validateMedicine(medicineId)
    if (!medicine) {
      throw new AppError(404, 'Thuốc không tồn tại')
    }

    const result = await crossBranchRepository.compareMedicineAcrossBranches(medicineId)

    if (!result) {
      throw new AppError(404, 'Không tìm thấy tồn kho cho thuốc này')
    }

    // Transform data để thêm status cho mỗi chi nhánh
    const transformedResult = {
      medicine_id: result.medicine_id,
      medicine_name: result.medicine_name,
      medicine_unit: result.medicine_unit,
      medicine_category: result.medicine_category,
      warning_threshold: result.warning_threshold,
      branches: result.branches.map((branch) => {
        const status =
          branch.quantity === 0
            ? 'out_of_stock'
            : branch.quantity <= result.warning_threshold
              ? 'low_stock'
              : 'sufficient'

        return {
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          branch_address: branch.branch_address,
          quantity: branch.quantity,
          status,
        }
      }),
    }

    return transformedResult
  }

  /**
   * Tìm chi nhánh có hàng sẵn (cho bán hàng & điều phối)
   * @param {String} medicineId - ID thuốc
   * @param {Number} quantity - Số lượng cần
   * @returns {Promise<Object>} - Thông tin thuốc và danh sách chi nhánh có hàng
   */
  async findAvailableBranches(medicineId, quantity) {
    // Validate medicineId
    if (!medicineId) {
      throw new AppError(400, 'ID thuốc là bắt buộc')
    }

    // Validate quantity
    if (!quantity || quantity <= 0) {
      throw new AppError(400, 'Số lượng phải lớn hơn 0')
    }

    // Validate medicine tồn tại
    const medicine = await crossBranchRepository.validateMedicine(medicineId)
    if (!medicine) {
      throw new AppError(404, 'Thuốc không tồn tại')
    }

    const result = await crossBranchRepository.findAvailableBranches(medicineId, quantity)

    if (!result) {
      throw new AppError(404, 'Không tìm thấy tồn kho cho thuốc này')
    }

    // Transform data để thêm status cho mỗi chi nhánh
    const transformedResult = {
      medicine_id: result.medicine_id,
      medicine_name: result.medicine_name,
      medicine_unit: result.medicine_unit,
      medicine_category: result.medicine_category,
      warning_threshold: result.warning_threshold,
      quantity_needed: quantity,
      available_branches: result.available_branches.map((branch) => {
        const status =
          branch.available_quantity === 0
            ? 'out_of_stock'
            : branch.available_quantity <= result.warning_threshold
              ? 'low_stock'
              : 'sufficient'

        return {
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          branch_address: branch.branch_address,
          available_quantity: branch.available_quantity,
          can_fulfill: branch.can_fulfill,
          status,
        }
      }),
    }

    return transformedResult
  }
}

export default new CrossBranchService()
