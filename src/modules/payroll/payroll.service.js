import mongoose from 'mongoose'
import payrollRepository from './payroll.repository.js'

const LATE_PENALTY = 50000 // 50,000 VND per late shift

class PayrollService {
  /**
   * Calculate payroll for a specific user and month
   * @param {ObjectId} user_id
   * @param {ObjectId} branch_id
   * @param {String} month - Format: YYYY-MM
   * @returns {Object} Payroll calculation result
   */
  async calculatePayroll(user_id, branch_id, month) {
    try {
      const { User } = await import('../users/users.model.js')
      const { default: WorkSchedule } = await import('../work_schedules/work_schedules.model.js')
      const { default: Attendance } = await import('../attendance/attendance.model.js')
      const { default: Invoice } = await import('../sales/sales.model.js')

      // Get user with salary
      const user = await User.findById(user_id)
      if (!user) {
        throw new Error('User not found')
      }

      const baseSalary = user.salary || 0

      // Get all work schedules for the month
      const [startYear, startMonth] = month.split('-')
      const startDate = new Date(`${startYear}-${startMonth}-01`)
      const endDate = new Date(startYear, startMonth, 0) // Last day of month

      const workSchedules = await WorkSchedule.find({
        user_id,
        branch_id,
        date: {
          $gte: startDate.toISOString().split('T')[0],
          $lte: endDate.toISOString().split('T')[0],
        },
      })

      const totalShifts = workSchedules.length

      // Calculate completed shifts and late shifts
      const { completedShifts, lateCount } = await this.calculateAttendance(
        user_id,
        branch_id,
        workSchedules,
        month
      )

      // Calculate penalty
      const penaltyAmount = lateCount * LATE_PENALTY

      // Calculate sales amount
      const salesAmount = await this.calculateSalesAmount(user_id, branch_id, month)

      // Calculate final salary
      const finalSalary = baseSalary + salesAmount - penaltyAmount

      return {
        user_id,
        branch_id,
        month,
        base_salary: baseSalary,
        total_shifts: totalShifts,
        completed_shifts: completedShifts,
        late_count: lateCount,
        penalty_amount: penaltyAmount,
        bonus_amount: 0,
        sales_amount: salesAmount,
        final_salary: Math.max(0, finalSalary), // Ensure non-negative
        status: 'pending',
        note: '',
      }
    } catch (error) {
      throw new Error(`Error calculating payroll: ${error.message}`)
    }
  }

  /**
   * Calculate attendance metrics
   * @param {ObjectId} user_id
   * @param {ObjectId} branch_id
   * @param {Array} workSchedules
   * @param {String} month
   * @returns {Object} { completedShifts, lateCount }
   */
  async calculateAttendance(user_id, branch_id, workSchedules, month) {
    try {
      const { default: Attendance } = await import('../attendance/attendance.model.js')

      let completedShifts = 0
      let lateCount = 0

      for (const schedule of workSchedules) {
        const [year, monthStr] = month.split('-')
        const scheduleDate = new Date(schedule.date)

        // Get attendance for this date - use date range query instead of $where
        const startOfDay = new Date(schedule.date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(schedule.date)
        endOfDay.setHours(23, 59, 59, 999)

        const attendance = await Attendance.findOne({
          user_id,
          branch_id,
          checkin_time: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        })

        if (attendance && attendance.checkin_time) {
          completedShifts++

          // Check if late (after scheduled time)
          const checkinTime = new Date(attendance.checkin_time)
          const isLate = this.isLate(schedule.shift, checkinTime)

          if (isLate) {
            lateCount++
          }
        }
      }

      return { completedShifts, lateCount }
    } catch (error) {
      throw new Error(`Error calculating attendance: ${error.message}`)
    }
  }

  /**
   * Check if employee is late
   * @param {String} shift - "morning" (09:00-15:00) or "afternoon" (15:00-22:00)
   * @param {Date} checkinTime
   * @returns {Boolean}
   */
  isLate(shift, checkinTime) {
    const hour = checkinTime.getHours()
    const minutes = checkinTime.getMinutes()
    const time = hour * 60 + minutes // Convert to minutes

    if (shift === 'morning' || shift === 'ca_sang') {
      return time > 9 * 60 // After 09:00
    } else if (shift === 'afternoon' || shift === 'ca_chieu') {
      return time > 15 * 60 // After 15:00
    }

    return false
  }

  /**
   * Calculate total sales amount for the user in the month
   * @param {ObjectId} user_id
   * @param {ObjectId} branch_id
   * @param {String} month - Format: YYYY-MM
   * @returns {Number}
   */
  async calculateSalesAmount(user_id, branch_id, month) {
    try {
      const { default: Invoice } = await import('../sales/sales.model.js')

      const [year, monthStr] = month.split('-')
      const startDate = new Date(`${year}-${monthStr}-01`)
      const endDate = new Date(year, parseInt(monthStr), 0)

      const invoices = await Invoice.find({
        employee_id: user_id,
        branch_id,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        status: 'completed', // Only count completed invoices
      })

      const totalSales = invoices.reduce((sum, invoice) => {
        return sum + (invoice.total_amount || 0)
      }, 0)

      return totalSales
    } catch (error) {
      throw new Error(`Error calculating sales: ${error.message}`)
    }
  }

  /**
   * Create a new payroll record
   * @param {Object} payrollData
   * @returns {Object} Created payroll
   */
  async createPayroll(payrollData) {
    try {
      // Check if payroll already exists
      const existing = await payrollRepository.exists(payrollData.user_id, payrollData.month)

      if (existing) {
        throw new Error(
          `Payroll for this user and month already exists. Status: ${existing.status}`
        )
      }

      // Create new payroll
      const payroll = await payrollRepository.create(payrollData)
      return payroll
    } catch (error) {
      throw new Error(`Error creating payroll: ${error.message}`)
    }
  }

  /**
   * Get payroll preview (calculate without saving)
   * @param {ObjectId} user_id
   * @param {ObjectId} branch_id
   * @param {String} month
   * @returns {Object}
   */
  async getPayrollPreview(user_id, branch_id, month) {
    return await this.calculatePayroll(user_id, branch_id, month)
  }

  /**
   * Get payroll by ID
   * @param {ObjectId} id
   * @returns {Object}
   */
  async getPayrollById(id) {
    const payroll = await payrollRepository.findById(id)
    if (!payroll) {
      throw new Error('Payroll not found')
    }
    return payroll
  }

  /**
   * Get payroll list with filters
   * @param {Object} filters
   * @param {Number} page
   * @param {Number} limit
   * @returns {Object}
   */
  async getPayrollList(filters = {}, page = 1, limit = 10) {
    // Convert string IDs to ObjectId if needed
    if (filters.user_id && typeof filters.user_id === 'string') {
      filters.user_id = new mongoose.Types.ObjectId(filters.user_id)
    }
    if (filters.branch_id && typeof filters.branch_id === 'string') {
      filters.branch_id = new mongoose.Types.ObjectId(filters.branch_id)
    }

    return await payrollRepository.findWithPagination(filters, page, limit)
  }

  /**
   * Approve payroll
   * @param {ObjectId} id
   * @param {ObjectId} approvedBy
   * @param {String} note
   * @returns {Object}
   */
  async approvePayroll(id, approvedBy, note = '') {
    const payroll = await payrollRepository.findById(id)
    if (!payroll) {
      throw new Error('Payroll not found')
    }

    if (payroll.status !== 'pending') {
      throw new Error(`Cannot approve payroll with status: ${payroll.status}`)
    }

    const updateData = {
      status: 'approved',
      approved_by: approvedBy,
      note: note || payroll.note,
    }

    return await payrollRepository.updateById(id, updateData)
  }

  /**
   * Reject payroll
   * @param {ObjectId} id
   * @param {String} reason
   * @returns {Object}
   */
  async rejectPayroll(id, reason = '') {
    const payroll = await payrollRepository.findById(id)
    if (!payroll) {
      throw new Error('Payroll not found')
    }

    if (payroll.status !== 'pending') {
      throw new Error(`Cannot reject payroll with status: ${payroll.status}`)
    }

    const updateData = {
      status: 'rejected',
      note: reason || `Rejected: ${new Date().toISOString()}`,
    }

    return await payrollRepository.updateById(id, updateData)
  }

  /**
   * Update payroll with bonus or adjustment
   * @param {ObjectId} id
   * @param {Object} updateData
   * @returns {Object}
   */
  async updatePayroll(id, updateData) {
    const payroll = await payrollRepository.findById(id)
    if (!payroll) {
      throw new Error('Payroll not found')
    }

    if (payroll.status !== 'pending') {
      throw new Error(`Cannot update payroll with status: ${payroll.status}`)
    }

    // Recalculate final_salary if bonus_amount is updated
    if (updateData.bonus_amount !== undefined) {
      const finalSalary =
        payroll.base_salary +
        payroll.sales_amount -
        payroll.penalty_amount +
        (updateData.bonus_amount || 0)
      updateData.final_salary = Math.max(0, finalSalary)
    }

    return await payrollRepository.updateById(id, updateData)
  }

  /**
   * Get branch payroll summary
   * @param {ObjectId} branch_id
   * @param {String} month
   * @returns {Object}
   */
  async getBranchSummary(branch_id, month) {
    return await payrollRepository.getBranchSummary(branch_id, month)
  }
}

export default new PayrollService()
