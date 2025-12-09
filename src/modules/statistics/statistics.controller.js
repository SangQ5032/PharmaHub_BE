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

  /**
   * GET /api/statistics/my-revenue
   * Lấy doanh thu cá nhân của nhân viên hiện tại
   * Hỗ trợ lọc theo ngày/tháng/năm
   */
  getEmployeePersonalRevenue = catchAsync(async (req, res) => {
    const { startDate, endDate, groupBy } = req.query
    const employeeId = req.user._id

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (groupBy) filters.groupBy = groupBy

    const result = await statisticsService.getEmployeePersonalRevenue(employeeId, filters)

    res.status(200).json({
      success: true,
      message: 'Lấy doanh thu cá nhân thành công',
      groupBy: result.groupBy,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/branch/revenue
   * Lấy thống kê doanh thu toàn cửa hàng theo chi nhánh
   */
  getBranchRevenueStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query
    const branchId = req.params.branchId

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const result = await statisticsService.getBranchRevenueStatistics(branchId, filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê doanh thu chi nhánh thành công',
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/branch/employees
   * Lấy thống kê doanh thu từng nhân viên theo chi nhánh
   */
  getBranchEmployeeRevenue = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query
    const branchId = req.params.branchId

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const result = await statisticsService.getBranchEmployeeRevenue(branchId, filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê doanh thu nhân viên thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/branch/medicines
   * Lấy thống kê số lượng thuốc đã bán ra
   */
  getBranchSalesMedicineStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query
    const branchId = req.params.branchId

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const result = await statisticsService.getBranchSalesMedicineStatistics(branchId, filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê bán hàng thành công',
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/branch/imports
   * Lấy thống kê các lô hàng đã nhập
   */
  getBranchImportStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate, supplierId } = req.query
    const branchId = req.params.branchId

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (supplierId) filters.supplierId = supplierId

    const result = await statisticsService.getBranchImportStatistics(branchId, filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê nhập hàng thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/branch/batch-status
   * Lấy thống kê tình trạng lô hàng
   */
  getBranchBatchStatusStatistics = catchAsync(async (req, res) => {
    const branchId = req.params.branchId

    const result = await statisticsService.getBranchBatchStatusStatistics(branchId)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tình trạng lô hàng thành công',
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/branch/customers
   * Lấy thống kê doanh thu theo khách hàng
   */
  getBranchCustomerStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query
    const branchId = req.params.branchId

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const result = await statisticsService.getBranchCustomerStatistics(branchId, filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê khách hàng thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/branch/revenue-by-period
   * Lấy thống kê doanh thu theo thời gian
   */
  getBranchRevenueByPeriod = catchAsync(async (req, res) => {
    const { startDate, endDate, groupBy } = req.query
    const branchId = req.params.branchId

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (groupBy) filters.groupBy = groupBy

    const result = await statisticsService.getBranchRevenueByPeriod(branchId, filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê doanh thu theo thời gian thành công',
      groupBy: result.groupBy,
      total: result.total,
      data: result.data,
    })
  })

  // ========== SYSTEM ADMIN STATISTICS ==========

  /**
   * GET /api/statistics/system-admin/overall
   * Lấy thống kê tổng quan toàn hệ thống (SYSTEM-ADMIN)
   */
  getSystemAdminOverallStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const result = await statisticsService.getSystemAdminOverallStatistics(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tổng quan toàn hệ thống thành công',
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/system-admin/branches-revenue
   * Lấy thống kê doanh thu từng chi nhánh (SYSTEM-ADMIN)
   */
  getSystemAdminBranchRevenueStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const result = await statisticsService.getSystemAdminBranchRevenueStatistics(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê doanh thu chi nhánh thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/system-admin/employees-revenue
   * Lấy thống kê doanh thu từng nhân viên toàn hệ thống (SYSTEM-ADMIN)
   */
  getSystemAdminEmployeeRevenueStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const result = await statisticsService.getSystemAdminEmployeeRevenueStatistics(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê doanh thu nhân viên thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/system-admin/top-selling
   * Lấy top thuốc bán chạy toàn hệ thống (SYSTEM-ADMIN)
   */
  getSystemAdminTopSellingMedicines = catchAsync(async (req, res) => {
    const { startDate, endDate, limit } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (limit) filters.limit = limit

    const result = await statisticsService.getSystemAdminTopSellingMedicines(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy top thuốc bán chạy toàn hệ thống thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/system-admin/revenue-by-period
   * Lấy thống kê doanh thu theo thời gian toàn hệ thống (SYSTEM-ADMIN)
   */
  getSystemAdminRevenueByPeriod = catchAsync(async (req, res) => {
    const { startDate, endDate, groupBy } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (groupBy) filters.groupBy = groupBy

    const result = await statisticsService.getSystemAdminRevenueByPeriod(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê doanh thu theo thời gian thành công',
      groupBy: result.groupBy,
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/system-admin/customers
   * Lấy thống kê doanh thu theo khách hàng toàn hệ thống (SYSTEM-ADMIN)
   */
  getSystemAdminCustomerStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const result = await statisticsService.getSystemAdminCustomerStatistics(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê khách hàng toàn hệ thống thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/system-admin/imports
   * Lấy thống kê tổng nhập hàng toàn hệ thống (SYSTEM-ADMIN)
   */
  getSystemAdminImportStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const result = await statisticsService.getSystemAdminImportStatistics(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê nhập hàng toàn hệ thống thành công',
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/system-admin/batch-status
   * Lấy thống kê tình trạng batch toàn hệ thống (SYSTEM-ADMIN)
   */
  getSystemAdminBatchStatusStatistics = catchAsync(async (req, res) => {
    const result = await statisticsService.getSystemAdminBatchStatusStatistics()

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tình trạng batch thành công',
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/system-admin/dashboard
   * Lấy dashboard tổng hợp cho system admin
   */
  getSystemAdminDashboard = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const [overall, topMedicines, branchStats, employeeStats, imports, batchStatus] =
      await Promise.all([
        statisticsService.getSystemAdminOverallStatistics(filters),
        statisticsService.getSystemAdminTopSellingMedicines({ ...filters, limit: 5 }),
        statisticsService.getSystemAdminBranchRevenueStatistics(filters),
        statisticsService.getSystemAdminEmployeeRevenueStatistics(filters),
        statisticsService.getSystemAdminImportStatistics(filters),
        statisticsService.getSystemAdminBatchStatusStatistics(),
      ])

    res.status(200).json({
      success: true,
      message: 'Lấy dashboard thành công',
      data: {
        overall: overall.data,
        topMedicines: topMedicines.data,
        branchStats: branchStats.data,
        employeeStats: employeeStats.data,
        imports: imports.data,
        batchStatus: batchStatus.data,
      },
    })
  })

  /**
   * GET /api/statistics/system-admin/branches-revenue-detailed
   * Lấy thống kê doanh thu tất cả chi nhánh (SYSTEM-ADMIN)
   */
  getSystemAdminBranchesRevenueStatistics = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const result = await statisticsService.getSystemAdminBranchesRevenueStatistics(filters)

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê doanh thu chi nhánh thành công',
      total: result.total,
      data: result.data,
    })
  })

  /**
   * GET /api/statistics/system-admin/branches-revenue-detail/:branchId
   * Lấy thống kê doanh thu chi tiết chi nhánh (SYSTEM-ADMIN)
   */
  getSystemAdminBranchDetailedRevenueStatistics = catchAsync(async (req, res) => {
    const { branchId } = req.params
    const { startDate, endDate, month } = req.query

    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (month) filters.month = month

    const result = await statisticsService.getSystemAdminBranchDetailedRevenueStatistics(
      branchId,
      filters
    )

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê doanh thu chi tiết chi nhánh thành công',
      data: result.data,
    })
  })
}

export default new StatisticsController()
