import * as usersService from './users.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { AppError } from '../../utils/AppError.js'

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await usersService.getAllUsers()
  res.json(users)
})

export const getUsersByBranch = asyncHandler(async (req, res) => {
  const user = req.user
  const userRole = user.role || (req.tokenPayload && req.tokenPayload.role) || ''
  const tokenRole = String(userRole).toLowerCase().replace(/_/g, '-')
  let branchId = user.branch_id

  // Allow system-admin to specify branch_id via query param
  if (!branchId && tokenRole === 'system-admin') {
    branchId = req.query.branch_id || req.query.branchId
  }

  if (!branchId) {
    throw new AppError(400, 'Tài khoản chưa được gán chi nhánh')
  }

  const users = await usersService.getUsersByBranch(branchId)
  res.json({
    succsess: true,
    message: 'Lấy danh sách người dùng theo chi nhánh thành công',
    data: users,
  })
})

export const getUsersByBranchParam = asyncHandler(async (req, res) => {
  const { branchId } = req.params

  if (!branchId) {
    throw new AppError(400, 'Branch ID là bắt buộc')
  }

  const users = await usersService.getUsersByBranch(branchId)
  res.json({
    success: true,
    message: 'Lấy danh sách người dùng theo chi nhánh thành công',
    data: users,
  })
})
