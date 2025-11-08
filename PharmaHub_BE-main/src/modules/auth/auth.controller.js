import * as authService from './auth.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body
  const result = await authService.loginWithUsername(username, password)
  res.json(result)
})
