import express from 'express'
const router = express.Router()
import branchController from './branch.controller.js'
import inventoryController from '../inventory/inventory.controller.js'
import reportsController from '../reports/reports.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

router.get('/', branchController.getAll)
router.post('/', branchController.create)
router.put('/:id', branchController.update)
router.delete('/:id', branchController.delete)
router.get('/:id', branchController.getById)

/**
 * @route   GET /api/branches/:id/inventory
 * @desc    Lấy tồn kho theo chi nhánh
 * @access  Private (employee, branch-manager, system-admin)
 */
router.get(
  '/:id/inventory',
  protect,
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  inventoryController.getInventoryByBranch
)

/**
 * @route   GET /api/branches/:id/reports/inventory
 * @desc    Lấy báo cáo tồn kho theo chi nhánh
 * @access  Private (branch-manager, system-admin)
 */
router.get(
  '/:id/reports/inventory',
  protect,
  authorizeRoles('branch-manager', 'system-admin'),
  reportsController.getInventoryReportByBranch
)

export default router
