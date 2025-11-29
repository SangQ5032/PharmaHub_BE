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

export default router
