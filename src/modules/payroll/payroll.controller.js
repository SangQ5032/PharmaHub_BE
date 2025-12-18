import payrollService from './payroll.service.js'
import { catchAsync } from '../../utils/catchAsync.js'
import { AppError } from '../../utils/AppError.js'

/**
 * GET /payrolls/preview?user_id=&branch_id=&month=
 * Get payroll preview (calculate without saving)
 */
export const previewPayroll = catchAsync(async (req, res, next) => {
  const { user_id, branch_id, month } = req.query

  if (!user_id || !branch_id || !month) {
    throw new AppError(400, 'user_id, branch_id, and month are required')
  }

  // Validate month format
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new AppError(400, 'month must be in format YYYY-MM')
  }

  const payrollData = await payrollService.getPayrollPreview(user_id, branch_id, month)

  res.status(200).json({
    success: true,
    message: 'Payroll preview calculated successfully',
    data: payrollData,
  })
})

/**
 * POST /payrolls
 * Create a new payroll record
 * Note: base_salary is always calculated from actual shifts worked
 */
export const createPayroll = catchAsync(async (req, res, next) => {
  const { user_id, branch_id, month, bonus_amount, note } = req.body

  if (!user_id || !branch_id || !month) {
    throw new AppError(400, 'user_id, branch_id, and month are required')
  }

  // Validate month format
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new AppError(400, 'month must be in format YYYY-MM')
  }

  // Calculate payroll automatically - base_salary is always calculated from actual shifts
  const payrollData = await payrollService.calculatePayroll(user_id, branch_id, month)

  // Add bonus and note if provided
  const finalPayrollData = {
    ...payrollData,
    bonus_amount: bonus_amount || 0,
    note: note || '',
  }

  // Recalculate final_salary with bonus
  finalPayrollData.final_salary =
    finalPayrollData.base_salary +
    finalPayrollData.sales_amount -
    finalPayrollData.penalty_amount +
    finalPayrollData.bonus_amount

  const payroll = await payrollService.createPayroll(finalPayrollData)

  res.status(201).json({
    success: true,
    message: 'Payroll created successfully',
    data: payroll,
  })
})

/**
 * GET /payrolls?branch_id=&month=&status=&user_id=&page=&limit=
 * Get list of payrolls with filters
 */
export const getPayrolls = catchAsync(async (req, res, next) => {
  const { branch_id, month, status, user_id, page = 1, limit = 10 } = req.query

  const filters = {}
  if (branch_id) filters.branch_id = branch_id
  if (month) filters.month = month
  if (status) {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new AppError(400, 'status must be one of: pending, approved, rejected')
    }
    filters.status = status
  }

  // Security: Employee can only see their own payroll
  if (req.user.role === 'employee') {
    filters.user_id = req.user._id
  } else if (user_id) {
    filters.user_id = user_id
  }

  const result = await payrollService.getPayrollList(filters, parseInt(page), parseInt(limit))

  res.status(200).json({
    success: true,
    message: 'Payrolls retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  })
})

/**
 * GET /payrolls/:id
 * Get payroll details by ID
 */
export const getPayrollById = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const payroll = await payrollService.getPayrollById(id)

  res.status(200).json({
    success: true,
    message: 'Payroll retrieved successfully',
    data: payroll,
  })
})

/**
 * PUT /payrolls/:id
 * Update payroll (add bonus or note)
 */
export const updatePayroll = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { bonus_amount, note } = req.body

  const updateData = {}
  if (bonus_amount !== undefined) updateData.bonus_amount = bonus_amount
  if (note !== undefined) updateData.note = note

  if (Object.keys(updateData).length === 0) {
    throw new AppError(400, 'At least one field to update is required')
  }

  const payroll = await payrollService.updatePayroll(id, updateData)

  res.status(200).json({
    success: true,
    message: 'Payroll updated successfully',
    data: payroll,
  })
})

/**
 * PUT /payrolls/:id/approve
 * Approve payroll
 */
export const approvePayroll = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { note } = req.body
  const approvedBy = req.user._id // From auth middleware

  const payroll = await payrollService.approvePayroll(id, approvedBy, note)

  res.status(200).json({
    success: true,
    message: 'Payroll approved successfully',
    data: payroll,
  })
})

/**
 * PUT /payrolls/:id/reject
 * Reject payroll
 */
export const rejectPayroll = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { reason } = req.body

  if (!reason) {
    throw new AppError(400, 'reason is required for rejection')
  }

  const payroll = await payrollService.rejectPayroll(id, reason)

  res.status(200).json({
    success: true,
    message: 'Payroll rejected successfully',
    data: payroll,
  })
})

/**
 * GET /payrolls/branch/:branch_id/summary?month=
 * Get payroll summary for a branch
 */
export const getBranchSummary = catchAsync(async (req, res, next) => {
  const { branch_id } = req.params
  const { month } = req.query

  if (!month) {
    throw new AppError(400, 'month query parameter is required')
  }

  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new AppError(400, 'month must be in format YYYY-MM')
  }

  const summary = await payrollService.getBranchSummary(branch_id, month)

  res.status(200).json({
    success: true,
    message: 'Branch payroll summary retrieved successfully',
    data: summary[0] || {
      total_payroll: 0,
      count: 0,
      approved_count: 0,
      pending_count: 0,
      rejected_count: 0,
    },
  })
})
