// src/modules/statistics/statistics.service.js
import statisticsRepository from './statistics.repository.js'
import { AppError } from '../../utils/AppError.js'

class StatisticsService {
  /**
   * Lấy thống kê tổng quan
   */
  async getOverallStatistics(filters) {
    try {
      const stats = await statisticsRepository.getOverallStats(filters)
      return {
        success: true,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê tổng quan: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê chi tiết theo thuốc
   */
  async getMedicineStatistics(filters) {
    try {
      const stats = await statisticsRepository.getMedicineStats(filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê thuốc: ' + error.message, 500)
    }
  }

  /**
   * Lấy top thuốc bán chạy
   */
  async getTopSellingMedicines(filters) {
    try {
      const stats = await statisticsRepository.getTopSellingMedicines(filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy top thuốc bán chạy: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê theo khoảng thời gian
   */
  async getStatisticsByPeriod(filters) {
    try {
      const validGroupBy = ['day', 'week', 'month', 'year']
      if (filters.groupBy && !validGroupBy.includes(filters.groupBy)) {
        throw new AppError('groupBy phải là: day, week, month hoặc year', 400)
      }

      const stats = await statisticsRepository.getStatsByPeriod(filters)
      return {
        success: true,
        total: stats.length,
        groupBy: filters.groupBy || 'day',
        data: stats,
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError('Lỗi khi lấy thống kê theo thời gian: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê theo chi nhánh
   */
  async getStatisticsByBranch(filters) {
    try {
      const stats = await statisticsRepository.getStatsByBranch(filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê theo chi nhánh: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê theo nhân viên
   */
  async getStatisticsByEmployee(filters) {
    try {
      const stats = await statisticsRepository.getStatsByEmployee(filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê theo nhân viên: ' + error.message, 500)
    }
  }

  /**
   * Lấy dashboard tổng hợp (kết hợp nhiều loại thống kê)
   */
  async getDashboardStats(filters) {
    try {
      const [overall, topMedicines, branchStats, employeeStats] = await Promise.all([
        statisticsRepository.getOverallStats(filters),
        statisticsRepository.getTopSellingMedicines({ ...filters, limit: 5 }),
        statisticsRepository.getStatsByBranch(filters),
        statisticsRepository.getStatsByEmployee(filters),
      ])

      return {
        success: true,
        data: {
          overall,
          topMedicines,
          branchStats,
          employeeStats,
        },
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy dashboard: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê cá nhân của nhân viên hiện tại
   * @param {string} employeeId - ID của nhân viên
   * @param {Object} filters - { startDate, endDate, groupBy }
   */
  async getEmployeePersonalStatistics(employeeId, filters) {
    try {
      const validGroupBy = ['day', 'week', 'month', 'year']
      if (filters.groupBy && !validGroupBy.includes(filters.groupBy)) {
        throw new AppError('groupBy phải là: day, week, month hoặc year', 400)
      }

      const stats = await statisticsRepository.getEmployeePersonalStatistics(employeeId, filters)

      return {
        success: true,
        groupBy: filters.groupBy || null,
        data: stats,
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError('Lỗi khi lấy thống kê cá nhân: ' + error.message, 500)
    }
  }

  /**
   * Lấy doanh thu cá nhân của nhân viên hiện tại
   * @param {string} employeeId - ID của nhân viên
   * @param {Object} filters - { startDate, endDate, groupBy }
   */
  async getEmployeePersonalRevenue(employeeId, filters) {
    try {
      const validGroupBy = ['day', 'week', 'month', 'year']
      if (filters.groupBy && !validGroupBy.includes(filters.groupBy)) {
        throw new AppError('groupBy phải là: day, week, month hoặc year', 400)
      }

      const stats = await statisticsRepository.getEmployeePersonalRevenue(employeeId, filters)

      return {
        success: true,
        groupBy: filters.groupBy || null,
        data: stats,
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError('Lỗi khi lấy doanh thu cá nhân: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê doanh thu toàn cửa hàng theo chi nhánh (BRANCH-MANAGER)
   */
  async getBranchRevenueStatistics(branchId, filters) {
    try {
      const stats = await statisticsRepository.getBranchRevenueStatistics(branchId, filters)
      return {
        success: true,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê doanh thu chi nhánh: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê doanh thu từng nhân viên theo chi nhánh
   */
  async getBranchEmployeeRevenue(branchId, filters) {
    try {
      const stats = await statisticsRepository.getBranchEmployeeRevenue(branchId, filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê doanh thu nhân viên: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê số lượng thuốc đã bán ra
   */
  async getBranchSalesMedicineStatistics(branchId, filters) {
    try {
      const stats = await statisticsRepository.getBranchSalesMedicineStatistics(branchId, filters)
      return {
        success: true,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê bán hàng: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê các lô hàng đã nhập
   */
  async getBranchImportStatistics(branchId, filters) {
    try {
      const stats = await statisticsRepository.getBranchImportStatistics(branchId, filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê nhập hàng: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê tình trạng lô hàng
   */
  async getBranchBatchStatusStatistics(branchId) {
    try {
      const stats = await statisticsRepository.getBranchBatchStatusStatistics(branchId)
      return {
        success: true,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê tình trạng lô hàng: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê doanh thu theo khách hàng
   */
  async getBranchCustomerStatistics(branchId, filters) {
    try {
      const stats = await statisticsRepository.getBranchCustomerStatistics(branchId, filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê khách hàng: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê doanh thu theo thời gian
   */
  async getBranchRevenueByPeriod(branchId, filters) {
    try {
      const validGroupBy = ['day', 'week', 'month', 'year']
      if (filters.groupBy && !validGroupBy.includes(filters.groupBy)) {
        throw new AppError('groupBy phải là: day, week, month hoặc year', 400)
      }

      const stats = await statisticsRepository.getBranchRevenueByPeriod(branchId, filters)
      return {
        success: true,
        total: stats.length,
        groupBy: filters.groupBy || 'day',
        data: stats,
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError('Lỗi khi lấy thống kê theo thời gian: ' + error.message, 500)
    }
  }

  // ========== SYSTEM ADMIN STATISTICS ==========

  /**
   * Lấy thống kê doanh thu từng chi nhánh (SYSTEM-ADMIN)
   */
  async getSystemAdminBranchRevenueStatistics(filters) {
    try {
      const stats = await statisticsRepository.getSystemAdminBranchRevenueStatistics(filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError(
        'Lỗi khi lấy thống kê doanh thu chi nhánh (system admin): ' + error.message,
        500
      )
    }
  }

  /**
   * Lấy thống kê tổng quan toàn hệ thống (SYSTEM-ADMIN)
   */
  async getSystemAdminOverallStatistics(filters) {
    try {
      const stats = await statisticsRepository.getSystemAdminOverallStatistics(filters)
      return {
        success: true,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê tổng quan toàn hệ thống: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê doanh thu từng nhân viên toàn hệ thống (SYSTEM-ADMIN)
   */
  async getSystemAdminEmployeeRevenueStatistics(filters) {
    try {
      const stats = await statisticsRepository.getSystemAdminEmployeeRevenueStatistics(filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê doanh thu nhân viên: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê chi tiết thuốc bán chạy toàn hệ thống (SYSTEM-ADMIN)
   */
  async getSystemAdminTopSellingMedicines(filters) {
    try {
      const stats = await statisticsRepository.getSystemAdminTopSellingMedicines(filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy top thuốc bán chạy: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê doanh thu theo thời gian toàn hệ thống (SYSTEM-ADMIN)
   */
  async getSystemAdminRevenueByPeriod(filters) {
    try {
      const validGroupBy = ['day', 'week', 'month', 'year']
      if (filters.groupBy && !validGroupBy.includes(filters.groupBy)) {
        throw new AppError('groupBy phải là: day, week, month hoặc year', 400)
      }

      const stats = await statisticsRepository.getSystemAdminRevenueByPeriod(filters)
      return {
        success: true,
        total: stats.length,
        groupBy: filters.groupBy || 'day',
        data: stats,
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError('Lỗi khi lấy thống kê doanh thu theo thời gian: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê doanh thu theo khách hàng toàn hệ thống (SYSTEM-ADMIN)
   */
  async getSystemAdminCustomerStatistics(filters) {
    try {
      const stats = await statisticsRepository.getSystemAdminCustomerStatistics(filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê khách hàng toàn hệ thống: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê tổng nhập hàng toàn hệ thống (SYSTEM-ADMIN)
   */
  async getSystemAdminImportStatistics(filters) {
    try {
      const stats = await statisticsRepository.getSystemAdminImportStatistics(filters)
      return {
        success: true,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê nhập hàng toàn hệ thống: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê tình trạng batch toàn hệ thống (SYSTEM-ADMIN)
   */
  async getSystemAdminBatchStatusStatistics() {
    try {
      const stats = await statisticsRepository.getSystemAdminBatchStatusStatistics()
      return {
        success: true,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê tình trạng batch: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê doanh thu tất cả chi nhánh (SYSTEM-ADMIN)
   */
  async getSystemAdminBranchesRevenueStatistics(filters) {
    try {
      const stats = await statisticsRepository.getSystemAdminBranchesRevenueStatistics(filters)
      return {
        success: true,
        total: stats.length,
        data: stats,
      }
    } catch (error) {
      throw new AppError('Lỗi khi lấy thống kê doanh thu chi nhánh: ' + error.message, 500)
    }
  }

  /**
   * Lấy thống kê doanh thu chi tiết chi nhánh (SYSTEM-ADMIN)
   */
  async getSystemAdminBranchDetailedRevenueStatistics(branchId, filters) {
    try {
      if (!branchId) {
        throw new AppError('ID chi nhánh không hợp lệ', 400)
      }

      const stats = await statisticsRepository.getSystemAdminBranchDetailedRevenueStatistics(
        branchId,
        filters
      )

      return {
        success: true,
        data: stats,
      }
    } catch (error) {
      if (error.message.includes('không hợp lệ')) {
        throw error
      }
      throw new AppError('Lỗi khi lấy thống kê doanh thu chi tiết: ' + error.message, 500)
    }
  }
}

export default new StatisticsService()
