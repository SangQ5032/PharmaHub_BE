import express from 'express'
import inventoryController from './inventory.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// Tất cả routes đều yêu cầu authentication
router.use(protect)

/**
 * @route   GET /api/inventory
 * @desc    Lấy tồn kho toàn hệ thống (admin only)
 * @access  Private (system-admin)
 * @query   branch_id, medicine_id, low_stock
 */
router.get('/', authorizeRoles('system-admin'), inventoryController.getAllInventory)

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
