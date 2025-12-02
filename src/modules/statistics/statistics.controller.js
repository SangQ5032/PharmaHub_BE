// src/modules/statistics/statistics.controller.js
import statisticsService from './statistics.service.js'
import { catchAsync } from '../../utils/catchAsync.js'

class StatisticsController {
  /**
   * GET /api/statistics/overall
   * Lấy thống kê tổng quan (tổng số lượng, tổng doanh thu)
   */
  getOverallStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate, branchId, employeeId } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (branchId) filters.branchId = branchId
    if (employeeId) filters.employeeId = employeeId

    const result = await statisticsService.getOverallStatistics(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tổng quan thành công',
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/medicines
   * Lấy thống kê chi tiết theo từng thuốc
   */
  getMedicineStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate, branchId, employeeId } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (branchId) filters.branchId = branchId
    if (employeeId) filters.employeeId = employeeId

    const result = await statisticsService.getMedicineStatistics(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê theo thuốc thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/top-selling
   * Lấy top thuốc bán chạy nhất
   */
  getTopSellingMedicines = catchAsync(async (req, res) => {
    const { startDate, endDate, branchId, employeeId, limit } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (branchId) filters.branchId = branchId
    if (employeeId) filters.employeeId = employeeId
    if (limit) filters.limit = limit

    const result = await statisticsService.getTopSellingMedicines(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy top thuốc bán chạy thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/by-period
   * Lấy thống kê theo khoảng thời gian (ngày, tuần, tháng)
   */
  getStatisticsByPeriod = catchAsync(async (req, res) => {
    const { startDate, endDate, branchId, employeeId, groupBy } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (branchId) filters.branchId = branchId
    if (employeeId) filters.employeeId = employeeId
    if (groupBy) filters.groupBy = groupBy

    const result = await statisticsService.getStatisticsByPeriod(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê theo thời gian thành công',
      groupBy: result.groupBy,
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/by-branch
   * Lấy thống kê theo chi nhánh
   */
  getStatisticsByBranch = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const result = await statisticsService.getStatisticsByBranch(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê theo chi nhánh thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/by-employee
   * Lấy thống kê theo nhân viên
   */
  getStatisticsByEmployee = catchAsync(async (req, res) => {
    const { startDate, endDate, branchId } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (branchId) filters.branchId = branchId

    const result = await statisticsService.getStatisticsByEmployee(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê theo nhân viên thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/dashboard
   * Lấy dashboard tổng hợp (kết hợp nhiều loại thống kê)
   */
  getDashboardStats = catchAsync(async (req, res) => {
    const { startDate, endDate, branchId, employeeId } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (branchId) filters.branchId = branchId
    if (employeeId) filters.employeeId = employeeId

    const result = await statisticsService.getDashboardStats(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy dashboard thành công',
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/my-stats
   * Lấy thống kê cá nhân của nhân viên hiện tại
   * Hỗ trợ lọc theo ngày/tháng/năm
   */
  getEmployeePersonalStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate, groupBy } = req.query
    const employeeId = req.user._id

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (groupBy) filters.groupBy = groupBy

    const result = await statisticsService.getEmployeePersonalStatistics(employeeId, filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê cá nhân thành công',
      groupBy: result.groupBy,
      data: result.data,
    })
  })
}

export default new StatisticsController()
