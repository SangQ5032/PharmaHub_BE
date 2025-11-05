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

export default router
