import express from 'express'
import salesController from './sales.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()
const invoicesRouter = express.Router()

router.use(protect)
invoicesRouter.use(protect)

// POST: Scan barcode để lấy thông tin thuốc
router.post(
  '/scan-barcode',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.scanMedicineBarcode
)

// POST: Tạo hoá đơn
router.post(
  '/',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.createInvoice
)

// GET: Lấy danh sách hoá đơn theo chi nhánh
// Yêu cầu: branchId từ token
// Query params: page, limit, employee_id (optional), customer_id (optional), from_date, to_date, search
invoicesRouter.post(
  '/',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.createInvoice
)

invoicesRouter.get(
  '/branch',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.getInvoicesByBranch
)

// GET: Lấy danh sách hoá đơn của nhân viên hiện tại
// Yêu cầu: branchId và employeeId từ token
// Query params: page, limit, from_date, to_date, search
invoicesRouter.get(
  '/me',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.getMyInvoices
)

// GET: Lấy chi tiết hoá đơn
// Yêu cầu: branchId từ token
invoicesRouter.get(
  '/:id',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.getInvoiceDetail
)

// Mount invoices sub-router
router.use('/invoices', invoicesRouter)

export default router
export { invoicesRouter }
