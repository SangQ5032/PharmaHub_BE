// MODULE: BATCHES - CONTROLLER (HTTP Layer)
// Mục đích: Nhận/đáp ứng HTTP request, gọi service xử lý
import * as batchesService from './batches.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

// POST /api/batches - tạo lô hàng
export const createBatch = asyncHandler(async (req, res) => {
  const created = await batchesService.createBatch(req.body)
  res.status(201).json({
    success: true,
    message: 'Tạo lô hàng thành công',
    data: created,
  })
})

// GET /api/batches/branch/:branchId - lấy tất cả lô hàng của chi nhánh
export const getBatchesByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params
  const result = await batchesService.getBatchesByBranch(branchId, req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách lô hàng thành công',
    data: result.data,
    pagination: result.pagination,
  })
})

// GET /api/batches/branch/:branchId/medicine/:medicineId - lô hàng của chi nhánh theo thuốc
export const getBatchesByBranchAndMedicine = asyncHandler(async (req, res) => {
  const { branchId, medicineId } = req.params
  const batches = await batchesService.getBatchesByBranchAndMedicine(branchId, medicineId)
  res.json({
    success: true,
    message: 'Lấy danh sách lô hàng thành công',
    data: batches,
  })
})

// GET /api/batches/:id - chi tiết 1 lô hàng
export const getBatchById = asyncHandler(async (req, res) => {
  const batch = await batchesService.getBatchById(req.params.id)
  res.json({
    success: true,
    message: 'Lấy chi tiết lô hàng thành công',
    data: batch,
  })
})

// PUT /api/batches/:id - cập nhật lô hàng
export const updateBatch = asyncHandler(async (req, res) => {
  const updated = await batchesService.updateBatch(req.params.id, req.body)
  res.json({
    success: true,
    message: 'Cập nhật lô hàng thành công',
    data: updated,
  })
})

// DELETE /api/batches/:id - xóa lô hàng
export const deleteBatch = asyncHandler(async (req, res) => {
  await batchesService.deleteBatch(req.params.id)
  res.status(204).json({
    success: true,
    message: 'Xóa lô hàng thành công',
  })
})

// GET /api/batches/medicines-with-batches/by-branch/:branchId - danh sách thuốc + chi tiết lô hàng
export const getMedicinesWithBatchesByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params
  const result = await batchesService.getMedicinesWithBatchesByBranch(branchId, req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách thuốc và lô hàng theo chi nhánh thành công',
    data: result.data,
    pagination: result.pagination,
  })
})
