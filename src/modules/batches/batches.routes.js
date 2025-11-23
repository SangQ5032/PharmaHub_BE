// MODULE: BATCHES - ROUTES (Route Definitions)
import express from 'express'
import * as batchesController from './batches.controller.js'

const router = express.Router()

// Lấy danh sách thuốc + chi tiết lô hàng (specific route trước)
router.get(
  '/medicines-with-batches/by-branch/:branchId',
  batchesController.getMedicinesWithBatchesByBranch
)

// Lấy lô hàng của chi nhánh theo thuốc (specific route)
router.get(
  '/branch/:branchId/medicine/:medicineId',
  batchesController.getBatchesByBranchAndMedicine
)

// Lấy tất cả lô hàng của chi nhánh
router.get('/branch/:branchId', batchesController.getBatchesByBranch)

// CRUD Batches
router.post('/', batchesController.createBatch)
router.get('/:id', batchesController.getBatchById)
router.put('/:id', batchesController.updateBatch)
router.delete('/:id', batchesController.deleteBatch)

export default router
