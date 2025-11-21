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
