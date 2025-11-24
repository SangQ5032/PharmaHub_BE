import express from 'express'
import salesController from './sales.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

// POST: Tạo hoá đơn
router.post(
  '/',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.createInvoice
)

// GET: Lấy danh sách hoá đơn theo chi nhánh
// Yêu cầu: branchId từ token
// Query params: page, limit, employee_id (optional), customer_id (optional), from_date, to_date, search
router.get(
  '/invoices/branch',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.getInvoicesByBranch
)

// GET: Lấy danh sách hoá đơn của nhân viên hiện tại
// Yêu cầu: branchId và employeeId từ token
// Query params: page, limit, from_date, to_date, search
router.get(
  '/invoices/me',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.getMyInvoices
)

// GET: Lấy chi tiết hoá đơn
// Yêu cầu: branchId từ token
router.get(
  '/invoices/:id',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.getInvoiceDetail
)

export default router
