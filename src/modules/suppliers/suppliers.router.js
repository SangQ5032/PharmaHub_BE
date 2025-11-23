// MODULE: SUPPLIERS - ROUTES
import express from 'express'
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getActiveSuppliers,
} from './suppliers.controller.js'
import { validateBody } from '../../middlewares/validate.js'
import { createSupplierSchema, updateSupplierSchema } from './suppliers.validation.js'

const router = express.Router()

// GET danh sách nhà cung cấp hoạt động
router.get('/active', getActiveSuppliers)

// GET danh sách nhà cung cấp (có phân trang, lọc, tìm kiếm)
router.get('/', getAllSuppliers)

// GET chi tiết nhà cung cấp
router.get('/:id', getSupplierById)

// POST tạo nhà cung cấp
router.post('/', validateBody(createSupplierSchema), createSupplier)

// PUT cập nhật nhà cung cấp
router.put('/:id', validateBody(updateSupplierSchema), updateSupplier)

// DELETE xóa nhà cung cấp
router.delete('/:id', deleteSupplier)

export default router
