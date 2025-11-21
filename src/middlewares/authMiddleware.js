import jwt from 'jsonwebtoken'
import config from '../config/default.js'
import { AppError } from '../utils/AppError.js'
import * as authRepo from '../modules/auth/auth.repository.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) return next(new AppError(401, 'Not authorized'))

  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    const user = await authRepo.findById(decoded.sub)
    if (!user) return next(new AppError(401, 'User not found'))

    req.user = user // gắn user vào req
    // save token payload for debugging / fallback role checks
    req.tokenPayload = decoded
    next()
  } catch (err) {
    next(new AppError(401, 'Invalid token'))
  }
}

// Check role middleware
export const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    // normalize role string for safe comparison and support fallback to token payload
    const normalize = (r) => (r && String(r).trim().toLowerCase().replace(/_/g, '-')) || null
    const allowed = roles.map(normalize)
    const userRole =
      normalize(req.user && req.user.role) || normalize(req.tokenPayload && req.tokenPayload.role)

    if (!userRole || !allowed.includes(userRole)) {
      return next(new AppError(403, 'Forbidden: insufficient permissions'))
    }
    next()
  }
