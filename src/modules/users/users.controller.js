import * as usersService from './users.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { AppError } from '../../utils/AppError.js'

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await usersService.getAllUsers()
  res.json({
    success: true,
    message: 'Lấy danh sách người dùng thành công',
    data: users,
  })
})

export const getUsersByBranch = asyncHandler(async (req, res) => {
  const user = req.user
  const userRole = user.role || (req.tokenPayload && req.tokenPayload.role) || ''
  const tokenRole = String(userRole).toLowerCase().replace(/_/g, '-')
  let branchId = user.branch_id

  // Allow system-admin to specify branch_id via query param
  if (tokenRole === 'system-admin') {
    const queryBranchId = req.query.branch_id || req.query.branchId
    if (queryBranchId) {
      branchId = queryBranchId
    }
  }

  if (!branchId) {
    throw new AppError(
      400,
      'Tài khoản chưa được gán chi nhánh, vui lòng truyền branchId vào query params'
    )
  }

  const users = await usersService.getUsersByBranch(branchId)
  res.json({
    success: true,
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

export const assignBranchToUser = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { branchId } = req.body

  if (!userId) {
    throw new AppError(400, 'User ID là bắt buộc')
  }

  if (!branchId) {
    throw new AppError(400, 'Branch ID là bắt buộc')
  }

  const updatedUser = await usersService.assignBranchToUser(userId, branchId)

  res.status(200).json({
    success: true,
    message: 'Gán chi nhánh cho nhân viên thành công',
    data: updatedUser,
  })
})

export const transferBranchForUser = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { newBranchId } = req.body

  if (!userId) {
    throw new AppError(400, 'User ID là bắt buộc')
  }

  if (!newBranchId) {
    throw new AppError(400, 'New Branch ID là bắt buộc')
  }

  const updatedUser = await usersService.transferBranchForUser(userId, newBranchId)

  res.status(200).json({
    success: true,
    message: 'Chuyển chi nhánh cho nhân viên thành công',
    data: updatedUser,
  })
})

export const createUser = asyncHandler(async (req, res) => {
  const { username, password_hash, name, role, branch_id, contact, salary, status } = req.body

  if (!username) {
    throw new AppError(400, 'Username là bắt buộc')
  }

  if (!password_hash) {
    throw new AppError(400, 'Password là bắt buộc')
  }

  if (!name) {
    throw new AppError(400, 'Tên nhân viên là bắt buộc')
  }

  const userData = {
    username,
    password_hash,
    name,
    role: role || 'employee',
    branch_id: branch_id || null,
    contact: contact || {},
    salary: salary || 0,
    status: status || 'active',
  }

  const newUser = await usersService.createUser(userData)

  res.status(201).json({
    success: true,
    message: 'Tạo nhân viên thành công',
    data: newUser,
  })
})
