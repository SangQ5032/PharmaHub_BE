import * as usersRepo from './users.repository.js'
import { AppError } from '../../utils/AppError.js'

export const getAllUsers = async () => {
  const users = await usersRepo.findAll()
  if (!users) throw new AppError(404, 'No users found')
  return users
}
