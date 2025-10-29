import * as usersService from './users.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await usersService.getAllUsers()
  res.json(users)
})
