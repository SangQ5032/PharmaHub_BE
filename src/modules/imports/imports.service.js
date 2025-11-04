import importRepository from './imports.repository.js'
import { AppError } from '../../utils/AppError.js'

class ImportService {
  /**
   * Tạo phiếu nhập hàng mới
   * @param {Object} importData - Dữ liệu phiếu nhập
   * @param {String} employeeId - ID nhân viên thực hiện
   * @returns {Promise<Object>} - Phiếu nhập đã tạo
   */
  async createImport(importData, employeeId) {
    const { branch_id, supplier_id, items, note } = importData

    // Validate dữ liệu đầu vào
    if (!branch_id || !supplier_id || !items || items.length === 0) {
      throw new AppError(400, 'Thiếu thông tin bắt buộc')
    }

    // Validate items
    for (const item of items) {
      if (!item.medicine_id || !item.quantity || item.quantity <= 0) {
        throw new AppError(400, 'Thông tin thuốc không hợp lệ')
      }
      if (item.unit_price === undefined || item.unit_price < 0) {
        throw new AppError(400, 'Đơn giá không hợp lệ')
      }
    }

    // Kiểm tra tồn tại của medicines và supplier
    const medicineIds = items.map((item) => item.medicine_id)
    const { medicines, supplier } = await importRepository.validateReferences(
      medicineIds,
      supplier_id
    )

    // Kiểm tra supplier
    if (!supplier) {
      throw new AppError(404, 'Nhà cung cấp không tồn tại')
    }

    if (supplier.status === 'inactive') {
      throw new AppError(400, 'Nhà cung cấp đã ngưng hoạt động')
    }

    // Kiểm tra medicines
    if (medicines.length !== medicineIds.length) {
      const foundIds = medicines.map((m) => m._id.toString())
      const missingIds = medicineIds.filter((id) => !foundIds.includes(id.toString()))
      throw new AppError(404, `Các thuốc sau không tồn tại: ${missingIds.join(', ')}`)
    }

    // Kiểm tra thuốc đã hết hạn
    const expiredMedicines = medicines.filter((m) => new Date(m.expiry_date) < new Date())
    if (expiredMedicines.length > 0) {
      const expiredNames = expiredMedicines.map((m) => m.name).join(', ')
      throw new AppError(400, `Các thuốc sau đã hết hạn: ${expiredNames}`)
    }

    // Tính tổng chi phí
    const total_cost = items.reduce((sum, item) => {
      return sum + item.quantity * item.unit_price
    }, 0)

    // Tạo phiếu nhập
    const importRecord = await importRepository.create({
      branch_id,
      supplier_id,
      employee_id: employeeId,
      items,
      total_cost,
      note,
      status: 'completed',
    })

    // Cập nhật inventory
    await importRepository.updateInventory(branch_id, items)

    // Lấy thông tin chi tiết phiếu nhập vừa tạo
    const result = await importRepository.findById(importRecord._id)

    return result
  }

  /**
   * Lấy danh sách phiếu nhập
   * @param {Object} query - Query parameters
   * @returns {Promise<Object>} - Danh sách phiếu nhập
   */
  async getImports(query) {
    const { branch_id, supplier_id, from_date, to_date, page, limit } = query

    const filter = {}

    if (branch_id) {
      filter.branch_id = branch_id
    }

    if (supplier_id) {
      filter.supplier_id = supplier_id
    }

    if (from_date || to_date) {
      filter.createdAt = {}
      if (from_date) {
        filter.createdAt.$gte = new Date(from_date)
      }
      if (to_date) {
        filter.createdAt.$lte = new Date(to_date)
      }
    }

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: { createdAt: -1 },
    }

    const result = await importRepository.findAll(filter, options)
    return result
  }

  /**
   * Lấy chi tiết phiếu nhập
   * @param {String} id - ID phiếu nhập
   * @returns {Promise<Object>} - Chi tiết phiếu nhập
   */
  async getImportById(id) {
    const importRecord = await importRepository.findById(id)

    if (!importRecord) {
      throw new AppError(404, 'Không tìm thấy phiếu nhập')
    }

    return importRecord
  }

  /**
   * Lấy thống kê nhập hàng theo chi nhánh
   * @param {String} branchId - ID chi nhánh
   * @param {Object} dateRange - Khoảng thời gian
   * @returns {Promise<Object>} - Thống kê
   */
  async getImportStats(branchId, dateRange) {
    const stats = await importRepository.getImportStatsByBranch(branchId, dateRange)
    return stats
  }
}

export default new ImportService()

