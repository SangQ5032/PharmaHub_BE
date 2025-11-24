// MODULE: BATCHES - SERVICE (Business Logic Layer)
// Mục đích: Xử lý logic nghiệp vụ
import batchesRepo from './batches.repository.js'
import { AppError } from '../../utils/AppError.js'

// Tạo lô hàng mới
export const createBatch = async (payload) => {
  // Validate số lượng
  if (payload.quantity > payload.initial_quantity) {
    throw new AppError(400, 'Số lượng không được vượt quá số lượng ban đầu')
  }

  const created = await batchesRepo.create(payload)
  return created
}

// Lấy chi tiết 1 lô hàng
export const getBatchById = async (id) => {
  const batch = await batchesRepo.findById(id)
  if (!batch) throw new AppError(404, 'Không tìm thấy lô hàng')
  return batch
}

// Lấy tất cả lô hàng của chi nhánh
export const getBatchesByBranch = async (branchId, query = {}) => {
  if (!branchId) {
    throw new AppError(400, 'Chi nhánh là bắt buộc')
  }

  const { page, limit, sort } = query
  const options = { page: Number(page) || 1, limit: Number(limit) || 100 }

  if (sort) {
    try {
      options.sort = JSON.parse(sort)
    } catch {
      options.sort = { createdAt: -1 }
    }
  }

  return await batchesRepo.findByBranchId(branchId, options)
}

// Lấy tất cả lô hàng của chi nhánh theo thuốc
export const getBatchesByBranchAndMedicine = async (branchId, medicineId) => {
  if (!branchId || !medicineId) {
    throw new AppError(400, 'Chi nhánh và thuốc là bắt buộc')
  }

  return await batchesRepo.findByBranchAndMedicine(branchId, medicineId)
}

// Cập nhật lô hàng
export const updateBatch = async (id, payload) => {
  // Validate số lượng
  if (payload.quantity && payload.initial_quantity && payload.quantity > payload.initial_quantity) {
    throw new AppError(400, 'Số lượng không được vượt quá số lượng ban đầu')
  }

  const updated = await batchesRepo.updateById(id, payload)
  if (!updated) throw new AppError(404, 'Không tìm thấy lô hàng')
  return updated
}

// Xóa lô hàng
export const deleteBatch = async (id) => {
  const deleted = await batchesRepo.deleteById(id)
  if (!deleted) throw new AppError(404, 'Không tìm thấy lô hàng')
  return deleted
}

// Lấy danh sách thuốc có tồn kho trong chi nhánh (kèm chi tiết lô hàng)
export const getMedicinesWithBatchesByBranch = async (branchId, query = {}) => {
  if (!branchId) {
    throw new AppError(400, 'Chi nhánh là bắt buộc')
  }

  const { page, limit, sort } = query
  const options = { page: Number(page) || 1, limit: Number(limit) || 10 }

  if (sort) {
    try {
      options.sort = JSON.parse(sort)
    } catch {
      options.sort = { createdAt: -1 }
    }
  }

  return await batchesRepo.getMedicinesWithBatchesByBranch(branchId, options)
}
