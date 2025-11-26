import * as usersRepo from './users.repository.js'
import { AppError } from '../../utils/AppError.js'

export const getAllUsers = async () => {
  const users = await usersRepo.findAll()
  if (!users) throw new AppError(404, 'No users found')
  return users
}

export const getUsersByBranch = async (branchId) => {
  if (!branchId) throw new AppError(400, 'Branch ID is required')
  const users = await usersRepo.findByBranchId(branchId)
  if (!users || users.length === 0) throw new AppError(404, 'No users found in this branch')
  return users
}

export const assignBranchToUser = async (userId, branchId) => {
  if (!userId) throw new AppError(400, 'User ID is required')
  if (!branchId) throw new AppError(400, 'Branch ID is required')

  // Check if user exists
  const user = await usersRepo.findById(userId)
  if (!user) throw new AppError(404, 'Nhân viên không tồn tại')

  // Check if user already has a branch
  if (user.branch_id) {
    throw new AppError(400, `Nhân viên này đang làm việc ở chi nhánh có ID: ${user.branch_id}`)
  }

  // Assign branch to user
  const updatedUser = await usersRepo.updateBranch(userId, branchId)
  return updatedUser
}

export const transferBranchForUser = async (userId, newBranchId) => {
  if (!userId) throw new AppError(400, 'User ID is required')
  if (!newBranchId) throw new AppError(400, 'New Branch ID is required')

  // Check if user exists
  const user = await usersRepo.findById(userId)
  if (!user) throw new AppError(404, 'Nhân viên không tồn tại')

  // Check if user has a branch
  if (!user.branch_id) {
    throw new AppError(400, 'Nhân viên chưa được gán chi nhánh')
  }

  // Transfer to new branch
  const updatedUser = await usersRepo.updateBranch(userId, newBranchId)
  return updatedUser
}

export const createUser = async (userData) => {
  if (!userData.username) throw new AppError(400, 'Username là bắt buộc')
  if (!userData.password_hash) throw new AppError(400, 'Password là bắt buộc')
  if (!userData.name) throw new AppError(400, 'Tên nhân viên là bắt buộc')

  // Check if username already exists
  const existingUser = await usersRepo.findByUsername(userData.username)
  if (existingUser) throw new AppError(400, 'Username đã tồn tại')

  // Create new user
  const newUser = await usersRepo.createUser(userData)
  return newUser
}
