// MODULE: BATCHES - ROUTES (Route Definitions)
import express from 'express'
import * as batchesController from './batches.controller.js'
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js'

const router = express.Router()

// Tất cả routes đều yêu cầu authentication
router.use(protect)

// Lấy danh sách thuốc + chi tiết lô hàng (specific route trước)
router.get(
  '/medicines-with-batches/by-branch/:branchId',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  batchesController.getMedicinesWithBatchesByBranch
)

// Lấy lô hàng của chi nhánh theo thuốc (specific route)
router.get(
  '/branch/:branchId/medicine/:medicineId',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  batchesController.getBatchesByBranchAndMedicine
)

// Lấy tất cả lô hàng của chi nhánh
router.get(
  '/branch/:branchId',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  batchesController.getBatchesByBranch
)

// CRUD Batches - Chi tiết lô hàng
router.get(
  '/:id',
  authorizeRoles('employee', 'branch-manager', 'system-admin'),
  batchesController.getBatchById
)

// Tạo lô hàng mới (chỉ branch-manager, system-admin)
router.post('/', authorizeRoles('branch-manager', 'system-admin'), batchesController.createBatch)

// Cập nhật lô hàng (chỉ branch-manager, system-admin)
router.put('/:id', authorizeRoles('branch-manager', 'system-admin'), batchesController.updateBatch)

// Xóa lô hàng (chỉ branch-manager, system-admin)
router.delete(
  '/:id',
  authorizeRoles('branch-manager', 'system-admin'),
  batchesController.deleteBatch
)

export default router
