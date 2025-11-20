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
      const validGroupBy = ['day', 'month', 'year']
      if (filters.groupBy && !validGroupBy.includes(filters.groupBy)) {
        throw new AppError('groupBy phải là: day, month hoặc year', 400)
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
}

export default new StatisticsService()
