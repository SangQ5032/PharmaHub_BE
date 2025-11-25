import express from 'express'
import inventoryController from './inventory.controller.js'
import reportsRoutes from '../reports/reports.routes.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// Tất cả routes đều yêu cầu authentication
router.use(protect)

// Mount reports routes (phải đặt trước route '/' để tránh conflict)
router.use(reportsRoutes)

/**
 * @route   GET /api/inventory/branch/:branchId/medicine/:medicineId
 * @desc    Lấy tồn kho của 1 loại thuốc tại chi nhánh cụ thể
 * @access  Private (employee, branch-manager, system-admin)
 */
router.get(
  '/branch/:branchId/medicine/:medicineId',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  inventoryController.getInventoryByBranchAndMedicine
)

/**
 * @route   GET /api/inventory/:inventoryId
 * @desc    Lấy chi tiết tồn kho bằng inventory ID
 * @access  Private (employee, branch-manager, system-admin)
 */
router.get(
  '/:inventoryId',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  inventoryController.getInventoryById
)

/**
 * @route   GET /api/inventory
 * @desc    Lấy tồn kho toàn hệ thống (admin only)
 * @access  Private (system-admin)
 * @query   branch_id, medicine_id, low_stock
 */
router.get('/', authorizeRoles('system-admin'), inventoryController.getAllInventory)

export default router
