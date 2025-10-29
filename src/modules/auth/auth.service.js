import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as authRepo from './auth.repository.js'

import config from '../../config/index.js'
import { AppError } from '../../utils/AppError.js'

export const loginWithUsername = async (username, password) => {
  const user = await authRepo.findByUsername(username)
  if (!user) throw new AppError(401, 'Invalid credentials')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new AppError(401, 'Invalid credentials')

  const accessToken = jwt.sign(
    { sub: user._id, role: user.role },
    config.jwt.secret, // đảm bảo là string
    { expiresIn: config.jwt.expiresIn } // string hoặc number, ví dụ "1h"
  )

  return {
    accessToken,
    user: { id: user._id, username: user.username, role: user.role },
  }
}
