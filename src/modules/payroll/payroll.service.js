import mongoose from 'mongoose'
import payrollRepository from './payroll.repository.js'

const LATE_PENALTY = 50000 // 50,000 VND per late shift
const MISSED_SHIFT_PENALTY = 200000 // 200,000 VND per missed shift

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

      const baseMonthlySalary = user.salary || 0 // Lương cơ bản theo tháng (26 công)

      // Get all work schedules for the month
      const [startYear, startMonth] = month.split('-')
      const startDate = new Date(`${startYear}-${startMonth}-01`)
      // Get last day of month: new Date(year, month, 0) where month is 1-indexed
      const endDate = new Date(parseInt(startYear), parseInt(startMonth), 0) // Last day of month

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

      // Calculate base salary based on 26 working days (26 shifts)
      // If worked more than 26 shifts, calculate additional salary
      const STANDARD_SHIFTS = 26 // 26 công chuẩn
      let baseSalary = 0

      if (completedShifts <= STANDARD_SHIFTS) {
        // Nếu làm ít hơn hoặc bằng 26 ca: tính theo tỷ lệ
        baseSalary = (completedShifts / STANDARD_SHIFTS) * baseMonthlySalary
      } else {
        // Nếu làm nhiều hơn 26 ca: lương cơ bản + lương thêm
        const salaryPerShift = baseMonthlySalary / STANDARD_SHIFTS
        const extraShifts = completedShifts - STANDARD_SHIFTS
        baseSalary = baseMonthlySalary + extraShifts * salaryPerShift
      }

      // Round base salary to remove decimal places
      baseSalary = Math.round(baseSalary)

      // Calculate missed shifts (shifts assigned but not checked in)
      const missedShifts = totalShifts - completedShifts

      // Calculate penalties
      const latePenaltyAmount = lateCount * LATE_PENALTY // Phạt đi muộn
      const missedPenaltyAmount = missedShifts * MISSED_SHIFT_PENALTY // Phạt không đi làm
      const totalPenaltyAmount = latePenaltyAmount + missedPenaltyAmount

      // Calculate sales amount
      const salesAmount = await this.calculateSalesAmount(user_id, branch_id, month)

      // Calculate final salary
      const finalSalary = baseSalary + salesAmount - totalPenaltyAmount

      return {
        user_id,
        branch_id,
        month,
        base_monthly_salary: baseMonthlySalary, // Lương cơ bản chuẩn theo tháng (26 công)
        base_salary: baseSalary, // Lương cơ bản đã tính theo số ca thực tế (đã làm tròn)
        total_shifts: totalShifts,
        completed_shifts: completedShifts,
        missed_shifts: missedShifts, // Số ca được giao nhưng nhân viên không checkin
        late_count: lateCount,
        late_penalty_amount: latePenaltyAmount, // Phạt đi muộn
        missed_penalty_amount: missedPenaltyAmount, // Phạt không đi làm
        penalty_amount: totalPenaltyAmount, // Tổng phạt (muộn + không đi làm)
        bonus_amount: 0,
        sales_amount: salesAmount,
        final_salary: Math.round(Math.max(0, finalSalary)), // Làm tròn và đảm bảo không âm
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

      // Get date range for the month (YYYY-MM)
      const [year, monthStr] = month.split('-')

      // Query attendances using regex to match ISO strings that start with YYYY-MM
      // checkin_time is stored as ISO string (e.g., "2025-12-01T08:00:00.000Z")
      const monthPattern = `^${year}-${monthStr}-`
      const attendances = await Attendance.find({
        user_id,
        branch_id,
        checkin_time: {
          $regex: monthPattern,
        },
      }).sort({ checkin_time: 1 })

      // Create a map of attendances by date and shift (YYYY-MM-DD_shift)
      // Key format: "2025-12-10_morning" or "2025-12-10_afternoon"
      const attendanceMap = new Map()
      for (const att of attendances) {
        if (att.checkin_time) {
          try {
            // Extract date part directly from ISO string to avoid timezone issues
            // Format: "2025-12-10T03:07:00.264Z" -> "2025-12-10"
            let dateKey = null
            let shift = null

            if (typeof att.checkin_time === 'string') {
              // Check if it's ISO format (contains 'T')
              if (att.checkin_time.includes('T')) {
                dateKey = att.checkin_time.split('T')[0] // Get YYYY-MM-DD part
                // Determine shift from checkin time (hour < 12 = morning, >= 12 = afternoon)
                const checkinDate = new Date(att.checkin_time)
                if (!isNaN(checkinDate.getTime())) {
                  const hour = checkinDate.getUTCHours()
                  shift = hour < 12 ? 'morning' : 'afternoon'
                }
              } else {
                // If not ISO format, try to parse as Date
                const checkinDate = new Date(att.checkin_time)
                if (!isNaN(checkinDate.getTime())) {
                  // Use UTC date to avoid timezone issues
                  const year = checkinDate.getUTCFullYear()
                  const month = String(checkinDate.getUTCMonth() + 1).padStart(2, '0')
                  const day = String(checkinDate.getUTCDate()).padStart(2, '0')
                  dateKey = `${year}-${month}-${day}`
                  const hour = checkinDate.getUTCHours()
                  shift = hour < 12 ? 'morning' : 'afternoon'
                }
              }
            }

            if (dateKey && shift) {
              // Create key with date and shift: "2025-12-10_morning"
              const mapKey = `${dateKey}_${shift}`
              // If multiple attendances on same date+shift, keep the first one (earliest checkin)
              if (!attendanceMap.has(mapKey)) {
                attendanceMap.set(mapKey, att)
              }
            }
          } catch (error) {
            // Skip invalid date formats
            console.warn(`Invalid checkin_time format: ${att.checkin_time}`, error)
          }
        }
      }

      // Check each work schedule - only count attendance if it matches both date AND shift
      for (const schedule of workSchedules) {
        const scheduleDateKey = schedule.date // YYYY-MM-DD format
        const scheduleShift = schedule.shift // 'morning' or 'afternoon'
        const mapKey = `${scheduleDateKey}_${scheduleShift}`
        const attendance = attendanceMap.get(mapKey)

        // Only count attendance if it matches the work schedule (both date and shift)
        // Attendance without matching work schedule will NOT be counted
        if (attendance && attendance.checkin_time) {
          completedShifts++

          // Count late shifts based on status = 'late' only
          if (attendance.status === 'late') {
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
   * @param {String} shift - "morning" (09:00) or "afternoon" (15:00)
   * @param {Date} checkinTime - Date object from ISO string (UTC)
   * @returns {Boolean}
   */
  isLate(shift, checkinTime) {
    // Use UTC time since checkin_time is stored as UTC ISO string
    // Example: "2025-12-10T03:07:00.264Z" -> 03:07 UTC
    const hour = checkinTime.getUTCHours()
    const minutes = checkinTime.getUTCMinutes()
    const time = hour * 60 + minutes // Convert to minutes

    if (shift === 'morning' || shift === 'ca_sang') {
      // Morning shift starts at 09:00 UTC
      return time > 9 * 60 // After 09:00 UTC
    } else if (shift === 'afternoon' || shift === 'ca_chieu') {
      // Afternoon shift starts at 15:00 UTC
      return time > 15 * 60 // After 15:00 UTC
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
