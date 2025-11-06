import express from 'express'
import importController from './imports.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// Tất cả routes đều yêu cầu authentication
router.use(protect)

/**
 * @route   POST /api/imports
 * @desc    Tạo phiếuh nhập àng mới
 * @access  Private (employee, branch-manager, supplier-manager)
 */
router.post(
  '/',
  authorizeRoles('employee', 'branch-manager', 'supplier-manager', 'system-admin'),
  importController.createImport
)

/**
 * @route   GET /api/imports
 * @desc    Lấy danh sách phiếu nhập
 * @access  Private (branch-manager, system-admin)
 * @query   branch_id, supplier_id, from_date, to_date, page, limit
 */
router.get('/', authorizeRoles('branch-manager', 'system-admin'), importController.getImports)

/**
 * @route   GET /api/imports/:id
 * @desc    Lấy chi tiết phiếu nhập
 * @access  Private (branch-manager, system-admin)
 */
router.get('/:id', authorizeRoles('branch-manager', 'system-admin'), importController.getImportById)

/**
 * @route   GET /api/imports/stats/:branchId
 * @desc    Lấy thống kê nhập hàng theo chi nhánh
 * @access  Private (branch-manager, system-admin)
 */
router.get(
  '/stats/:branchId',
  authorizeRoles('branch-manager', 'system-admin'),
  importController.getImportStats
)

export default router
