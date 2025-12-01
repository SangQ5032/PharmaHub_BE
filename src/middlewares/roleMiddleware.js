import { AppError } from '../utils/AppError.js'

/**
 * Middleware to check if user has required role
 * @param {...string} allowedRoles - Roles that are allowed to access
 * @returns {Function} Express middleware
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authenticated'))
    }

    // Normalize user role: convert "branch-manager" to "branch_manager", etc.
    const userRole = (req.user.role || '').toLowerCase().replace(/-/g, '_')

    // Normalize allowed roles as well
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      (role || '').toLowerCase().replace(/-/g, '_')
    )

    if (!normalizedAllowedRoles.includes(userRole)) {
      return next(new AppError(403, `Access denied. Required role: ${allowedRoles.join(' or ')}`))
    }

    next()
  }
}

/**
 * Middleware to check if user is branch manager or system manager
 */
export const isBranchOrSystemManager = (req, res, next) => {
  return requireRole('branch_manager', 'system_manager')(req, res, next)
}

/**
 * Middleware to check if user is system manager
 */
export const isSystemManager = (req, res, next) => {
  return requireRole('system_manager')(req, res, next)
}

/**
 * Middleware to check if user is employee
 */
export const isEmployee = (req, res, next) => {
  return requireRole('employee', 'branch_manager', 'system_manager')(req, res, next)
}

/**
 * Middleware to check user access to payroll
 * - Branch manager can see payrolls of their branch
 * - System manager can see all payrolls
 * - Employee can only see their own payroll
 */
export const checkPayrollAccess = (req, res, next) => {
  if (!req.user) {
    return next(new AppError(401, 'Not authenticated'))
  }

  // Normalize role: convert "branch-manager" to "branch_manager", etc.
  const userRole = (req.user.role || '').toLowerCase().replace(/-/g, '_')
  const { branch_id, user_id } = req.query || req.body || {}

  if (userRole === 'system_manager') {
    // System manager can access all
    return next()
  }

  if (userRole === 'branch_manager') {
    // Branch manager can access payrolls of their branch
    if (branch_id && branch_id !== req.user.branch_id?.toString()) {
      return next(new AppError(403, 'Can only access payrolls of your branch'))
    }
    return next()
  }

  if (userRole === 'employee') {
    // Employee can only access their own payroll
    if (user_id && user_id !== req.user._id?.toString()) {
      return next(new AppError(403, 'Can only access your own payroll'))
    }
    return next()
  }

  return next(new AppError(403, 'Invalid role'))
}
