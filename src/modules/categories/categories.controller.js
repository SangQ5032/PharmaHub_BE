// MODULE: CATEGORIES - CONTROLLER (HTTP Layer)
import * as categoriesService from './categories.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

// POST /api/categories - tạo danh mục
export const createCategory = asyncHandler(async (req, res) => {
  const created = await categoriesService.createCategory(req.body)
  res.status(201).json({
    success: true,
    message: 'Tạo danh mục thành công',
    data: created,
  })
})

// GET /api/categories - danh sách danh mục
export const getCategories = asyncHandler(async (req, res) => {
  const result = await categoriesService.getCategories(req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách danh mục thành công',
    data: result.data,
    pagination: result.pagination,
  })
})

// GET /api/categories/:id - chi tiết 1 danh mục
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoriesService.getCategoryById(req.params.id)
  res.json({
    success: true,
    message: 'Lấy chi tiết danh mục thành công',
    data: category,
  })
})

// PUT /api/categories/:id - cập nhật danh mục
export const updateCategory = asyncHandler(async (req, res) => {
  const updated = await categoriesService.updateCategory(req.params.id, req.body)
  res.json({
    success: true,
    message: 'Cập nhật danh mục thành công',
    data: updated,
  })
})

// DELETE /api/categories/:id - xóa danh mục
export const deleteCategory = asyncHandler(async (req, res) => {
  await categoriesService.deleteCategory(req.params.id)
  res.status(204).json({
    success: true,
    message: 'Xóa danh mục thành công',
  })
})

// GET /api/categories/status/:status - danh mục theo trạng thái
export const getCategoriesByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params
  const result = await categoriesService.getCategoriesByStatus(status, req.query)
  res.json({
    success: true,
    message: 'Lấy danh sách danh mục theo trạng thái thành công',
    data: result.data,
    pagination: result.pagination,
  })
})

// GET /api/categories/dropdown/active - danh mục cho dropdown
export const getActiveCategoriesForDropdown = asyncHandler(async (req, res) => {
  const data = await categoriesService.getActiveCategoriesForDropdown()
  res.json({
    success: true,
    message: 'Lấy danh mục active thành công',
    data,
  })
})
