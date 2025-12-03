// src/modules/statistics/statistics.routes.js
import express from 'express'
import statisticsController from './statistics.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// Tất cả các route thống kê đều yêu cầu authentication
router.use(protect)

/**
 * @route   GET /api/statistics/overall
 * @desc    Lấy thống kê tổng quan (tổng số lượng, tổng doanh thu)
 * @access  Private (branch-manager, system-admin, admin)
 * @query   startDate, endDate, branchId, employeeId
 */
router.get(
  '/overall',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getOverallStatistics
)

/**
 * @route   GET /api/statistics/medicines
 * @desc    Lấy thống kê chi tiết theo từng thuốc
 * @access  Private (branch-manager, system-admin, admin)
 * @query   startDate, endDate, branchId, employeeId
 */
router.get(
  '/medicines',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getMedicineStatistics
)

/**
 * @route   GET /api/statistics/top-selling
 * @desc    Lấy top thuốc bán chạy nhất
 * @access  Private (branch-manager, system-admin, admin)
 * @query   startDate, endDate, branchId, employeeId, limit (default: 10)
 */
router.get(
  '/top-selling',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getTopSellingMedicines
)

/**
 * @route   GET /api/statistics/by-period
 * @desc    Lấy thống kê theo khoảng thời gian (ngày, tuần, tháng, năm)
 * @access  Private (branch-manager, system-admin, admin)
 * @query   startDate, endDate, branchId, employeeId, groupBy (day|week|month|year)
 */
router.get(
  '/by-period',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getStatisticsByPeriod
)

/**
 * @route   GET /api/statistics/by-branch
 * @desc    Lấy thống kê theo chi nhánh
 * @access  Private (system-admin, admin)
 * @query   startDate, endDate
 */
router.get(
  '/by-branch',
  authorizeRoles('system_admin', 'admin'),
  statisticsController.getStatisticsByBranch
)

/**
 * @route   GET /api/statistics/by-employee
 * @desc    Lấy thống kê theo nhân viên
 * @access  Private (branch-manager, system-admin, admin)
 * @query   startDate, endDate, branchId
 */
router.get(
  '/by-employee',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getStatisticsByEmployee
)

/**
 * @route   GET /api/statistics/dashboard
 * @desc    Lấy dashboard tổng hợp (kết hợp nhiều loại thống kê)
 * @access  Private (branch-manager, system-admin, admin)
 * @query   startDate, endDate, branchId, employeeId
 */
router.get(
  '/dashboard',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getDashboardStats
)

/**
 * @route   GET /api/statistics/my-stats
 * @desc    Lấy thống kê cá nhân của nhân viên hiện tại
 * @access  Private (employee, branch-manager, system-admin, admin)
 * @query   startDate, endDate, groupBy (day|week|month|year)
 */
router.get(
  '/my-stats',
  authorizeRoles('employee', 'branch-manager', 'system_admin', 'admin'),
  statisticsController.getEmployeePersonalStatistics
)

// ========== BRANCH MANAGER STATISTICS ==========

/**
 * @route   GET /api/statistics/branch/:branchId/revenue
 * @desc    Lấy thống kê doanh thu toàn cửa hàng theo chi nhánh
 * @access  Private (branch-manager, system-admin, admin)
 * @params  branchId
 * @query   startDate, endDate
 */
router.get(
  '/branch/:branchId/revenue',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getBranchRevenueStatistics
)

/**
 * @route   GET /api/statistics/branch/:branchId/employees
 * @desc    Lấy thống kê doanh thu từng nhân viên theo chi nhánh
 * @access  Private (branch-manager, system-admin, admin)
 * @params  branchId
 * @query   startDate, endDate
 */
router.get(
  '/branch/:branchId/employees',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getBranchEmployeeRevenue
)

/**
 * @route   GET /api/statistics/branch/:branchId/medicines
 * @desc    Lấy thống kê số lượng thuốc đã bán ra
 * @access  Private (branch-manager, system-admin, admin)
 * @params  branchId
 * @query   startDate, endDate
 */
router.get(
  '/branch/:branchId/medicines',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getBranchSalesMedicineStatistics
)

/**
 * @route   GET /api/statistics/branch/:branchId/imports
 * @desc    Lấy thống kê các lô hàng đã nhập
 * @access  Private (branch-manager, system-admin, admin)
 * @params  branchId
 * @query   startDate, endDate, supplierId
 */
router.get(
  '/branch/:branchId/imports',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getBranchImportStatistics
)

/**
 * @route   GET /api/statistics/branch/:branchId/batch-status
 * @desc    Lấy thống kê tình trạng lô hàng (hết/còn hàng, còn/hết hạn)
 * @access  Private (branch-manager, system-admin, admin)
 * @params  branchId
 */
router.get(
  '/branch/:branchId/batch-status',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getBranchBatchStatusStatistics
)

/**
 * @route   GET /api/statistics/branch/:branchId/customers
 * @desc    Lấy thống kê doanh thu và số đơn hàng theo khách hàng
 * @access  Private (branch-manager, system-admin, admin)
 * @params  branchId
 * @query   startDate, endDate
 */
router.get(
  '/branch/:branchId/customers',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getBranchCustomerStatistics
)

/**
 * @route   GET /api/statistics/branch/:branchId/revenue-by-period
 * @desc    Lấy thống kê doanh thu theo thời gian
 * @access  Private (branch-manager, system-admin, admin)
 * @params  branchId
 * @query   startDate, endDate, groupBy (day|week|month|year)
 */
router.get(
  '/branch/:branchId/revenue-by-period',
  authorizeRoles('branch-manager', 'system_admin', 'admin'),
  statisticsController.getBranchRevenueByPeriod
)

export default router
