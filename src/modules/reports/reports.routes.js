import express from 'express'
import reportsController from './reports.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// Tất cả routes đều yêu cầu authentication
router.use(protect)

/**
 * @route   GET /api/inventory/report
 * @desc    Lấy báo cáo tồn kho toàn hệ thống
 * @access  Private (branch-manager, system-admin)
 * @query   branch_id (optional)
 */
router.get(
  '/report',
  authorizeRoles('branch-manager', 'system-admin'),
  reportsController.getInventoryReportAll
)

export default router
