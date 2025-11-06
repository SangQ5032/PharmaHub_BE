// MODULE: REPORTS - SERVICE (Business Logic Layer)
// Mục đích: Xử lý business logic cho báo cáo tồn kho
// - Validate dữ liệu đầu vào
// - Gọi repository để lấy dữ liệu
// - Transform/format dữ liệu trước khi trả về controller

import reportsRepository from './reports.repository.js'
import AppError from '../../utils/AppError.js'

class ReportsService {
  /**
   * Lấy báo cáo tồn kho theo chi nhánh
   * @param {String} branchId - ID chi nhánh
   * @returns {Object} Báo cáo tồn kho
   */
  async getInventoryReportByBranch(branchId) {
    // Validate branch tồn tại
    const branchExists = await reportsRepository.validateBranch(branchId)
    if (!branchExists) {
      throw new AppError('Chi nhánh không tồn tại', 404)
    }

    // Lấy báo cáo từ repository
    const report = await reportsRepository.getInventoryReportByBranch(branchId)

    // Nếu không có dữ liệu tồn kho
    if (!report) {
      return {
        branch_id: branchId,
        branch_name: null,
        branch_address: null,
        report_date: new Date(),
        summary: {
          total_medicines: 0,
          total_quantity: 0,
          low_stock_count: 0,
          out_of_stock_count: 0,
          expiring_soon_count: 0,
          expired_count: 0,
        },
        items: [],
      }
    }

    return report
  }

  /**
   * Lấy báo cáo tồn kho toàn hệ thống
   * @param {Object} query - Query parameters
   * @returns {Object} Báo cáo tổng hợp
   */
  async getInventoryReportAll(query = {}) {
    const { branch_id } = query

    // Nếu có branch_id, validate
    if (branch_id) {
      const branchExists = await reportsRepository.validateBranch(branch_id)
      if (!branchExists) {
        throw new AppError('Chi nhánh không tồn tại', 404)
      }
    }

    // Lấy báo cáo từ repository
    const reports = await reportsRepository.getInventoryReportAll(branch_id || null)

    // Tính tổng toàn hệ thống
    const systemSummary = reports.reduce(
      (acc, report) => {
        acc.total_branches += 1
        acc.total_medicines += report.summary.total_medicines
        acc.total_quantity += report.summary.total_quantity
        acc.low_stock_count += report.summary.low_stock_count
        acc.out_of_stock_count += report.summary.out_of_stock_count
        acc.expiring_soon_count += report.summary.expiring_soon_count
        acc.expired_count += report.summary.expired_count
        return acc
      },
      {
        total_branches: 0,
        total_medicines: 0,
        total_quantity: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        expiring_soon_count: 0,
        expired_count: 0,
      }
    )

    return {
      report_date: new Date(),
      system_summary: systemSummary,
      branches: reports,
    }
  }
}

export default new ReportsService()
