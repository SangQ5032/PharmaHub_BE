import express from 'express'
import crossBranchController from './cross-branch.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// Tất cả routes đều yêu cầu authentication
router.use(protect)

/**
 * @route   GET /api/inventory/cross-branch
 * @desc    Xem tồn kho tất cả chi nhánh
 * @access  Private (employee, branch-manager, system-admin)
 * @query   medicine_id (optional), branch_id (optional), sort_by (optional: asc/desc)
 */
router.get(
  '/',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  crossBranchController.getAllBranchesInventory
)

/**
 * @route   GET /api/inventory/cross-branch/compare
 * @desc    So sánh tồn kho của 1 loại thuốc giữa các chi nhánh
 * @access  Private (employee, branch-manager, system-admin)
 * @query   medicine_id (required)
 */
router.get(
  '/compare',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  crossBranchController.compareMedicineAcrossBranches
)

/**
 * @route   GET /api/inventory/cross-branch/available
 * @desc    Tìm chi nhánh có hàng sẵn (cho bán hàng & điều phối)
 * @access  Private (employee, branch-manager, system-admin)
 * @query   medicine_id (required), quantity (required)
 */
router.get(
  '/available',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  crossBranchController.findAvailableBranches
)

export default router
