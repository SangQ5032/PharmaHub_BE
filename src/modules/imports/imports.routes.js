import express from 'express'
import importController from './imports.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// Tất cả routes đều yêu cầu authentication
router.use(protect)

/**
 * @route   POST /api/imports
 * @desc    Tạo phiếu nhập hàng mới
 * @access  Private (employee, branch-manager, supplier-manager, system-admin)
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
 * @route   PATCH /api/imports/:id/status
 * @desc    Cập nhật trạng thái phiếu nhập
 * @access  Private (branch-manager, system-admin)
 * @body    { status: 'pending' | 'completed' | 'cancelled' }
 */
router.patch(
  '/:id/status',
  authorizeRoles('branch-manager', 'system-admin'),
  importController.updateImportStatus
)

/**
 * @route   POST /api/imports/:id/cancel
 * @desc    Hủy phiếu nhập hàng (rollback inventory)
 * @access  Private (branch-manager, system-admin)
 * @body    { reason: String }
 */
router.post(
  '/:id/cancel',
  authorizeRoles('branch-manager', 'system-admin'),
  importController.cancelImport
)

/**
 * @route   GET /api/imports/branch/:branchId
 * @desc    Lấy danh sách import theo chi nhánh
 * @access  Private (branch-manager, system-admin)
 * @query   supplier_id, status, from_date, to_date, page, limit
 */
router.get(
  '/branch/:branchId',
  authorizeRoles('branch-manager', 'system-admin'),
  importController.getImportsByBranch
)

/**
 * @route   GET /api/imports/stats/:branchId
 * @desc    Lấy thống kê nhập hàng theo chi nhánh
 * @access  Private (branch-manager, system-admin)
 * @query   from_date, to_date
 */
router.get(
  '/stats/:branchId',
  authorizeRoles('branch-manager', 'system-admin'),
  importController.getImportStats
)

export default router
