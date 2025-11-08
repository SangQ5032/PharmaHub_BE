import express from 'express'
import salesController from './sales.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// Bắt buộc đăng nhập cho toàn bộ /sales
router.use(protect)

// Tạo hóa đơn
router.post(
  '/',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.createInvoice
)

// Danh sách hóa đơn (quản lý xem)
router.get('/', authorizeRoles('branch-manager', 'system-admin'), salesController.listInvoices)

// Chi tiết 1 hóa đơn
router.get(
  '/:id',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  salesController.getInvoiceById
)

export default router
