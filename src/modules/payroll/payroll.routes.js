import express from 'express'
import {
  previewPayroll,
  createPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
  approvePayroll,
  rejectPayroll,
  getBranchSummary,
} from './payroll.controller.js'
import { protect } from '../../middlewares/authMiddleware.js'
import {
  requireRole,
  isBranchOrSystemManager,
  isSystemManager,
  isEmployee,
  checkPayrollAccess,
} from '../../middlewares/roleMiddleware.js'

const router = express.Router()

// Apply auth middleware to all routes
router.use(protect)

/**
 * @route   GET /api/payrolls/preview
 * @desc    Get payroll preview (calculate without saving)
 * @query   user_id, branch_id, month (YYYY-MM)
 * @access  Private - Branch Manager, System Manager
 */
router.get('/preview', requireRole('branch_manager', 'system_admin'), previewPayroll)

/**
 * @route   POST /api/payrolls
 * @desc    Create a new payroll record
 * @body    user_id, branch_id, month, base_salary, bonus_amount (optional), note (optional)
 * @access  Private - Branch Manager, System Manager
 */
router.post('/', requireRole('branch_manager', 'system_admin'), createPayroll)

/**
 * @route   GET /api/payrolls
 * @desc    Get list of payrolls with filters
 * @query   branch_id, month, status, user_id, page, limit
 * @access  Private - All authenticated users (with permission checks)
 */
router.get('/', checkPayrollAccess, getPayrolls)

/**
 * @route   GET /api/payrolls/:id
 * @desc    Get payroll details by ID
 * @access  Private - Branch Manager, System Manager, Employee (own payroll)
 */
router.get('/:id', isEmployee, getPayrollById)

/**
 * @route   PUT /api/payrolls/:id
 * @desc    Update payroll (add bonus or note)
 * @body    bonus_amount (optional), note (optional)
 * @access  Private - Branch Manager, System Manager
 */
router.put('/:id', requireRole('branch_manager', 'system_admin'), updatePayroll)

/**
 * @route   PUT /api/payrolls/:id/approve
 * @desc    Approve payroll
 * @body    note (optional)
 * @access  Private - System Manager
 */
router.put('/:id/approve', isSystemManager, approvePayroll)

/**
 * @route   PUT /api/payrolls/:id/reject
 * @desc    Reject payroll
 * @body    reason (required)
 * @access  Private - System Manager
 */
router.put('/:id/reject', isSystemManager, rejectPayroll)

/**
 * @route   GET /api/payrolls/branch/:branch_id/summary
 * @desc    Get payroll summary for a branch
 * @query   month (required, YYYY-MM)
 * @access  Private - Branch Manager (own branch), System Manager
 */
router.get('/branch/:branch_id/summary', isBranchOrSystemManager, getBranchSummary)

export default router
