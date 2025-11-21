import * as usersService from './users.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await usersService.getAllUsers()
  res.json(users)
})

export const getUsersByBranch = asyncHandler(async (req, res) => {
  const branchId = req.user.branch_id
  const users = await usersService.getUsersByBranch(branchId)
  res.json({
    succsess: true,
    message: 'Lấy danh sách người dùng theo chi nhánh thành công',
    data: users,
  })
})
