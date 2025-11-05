import express from 'express'
const router = express.Router()
import branchController from './branch.controller.js'
import inventoryController from '../inventory/inventory.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

router.get('/', branchController.getAll)

/**
 * @route   GET /api/branches/:id/inventory
 * @desc    Lấy tồn kho theo chi nhánh
 * @access  Private (employee, branch-manager, system-admin)
 * @query   medicine_id, low_stock
 */
router.get(
  '/:id/inventory',
  protect,
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  inventoryController.getInventoryByBranch
)

export default router
