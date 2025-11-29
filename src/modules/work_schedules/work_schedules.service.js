import workScheduleRepository from './work_schedules.repository.js'
import { User } from '../users/users.model.js'
import mongoose from 'mongoose'

class WorkScheduleService {
  // Validate date format YYYY-MM-DD
  validateDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(dateString)) {
      throw new Error('Date must be in YYYY-MM-DD format')
    }

    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }

    return true
  }

  // Helper: check if shift value is valid (not null, not empty string)
  isValidShiftValue(value) {
    return value && value !== null && (typeof value !== 'string' || value.trim() !== '')
  }

  // Validate shift
  validateShift(shift) {
    if (!['morning', 'afternoon'].includes(shift)) {
      throw new Error('Shift must be either "morning" or "afternoon"')
    }
    return true
  }

  // Validate user exists and is not manager
  async validateUser(userId, branchId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user_id')
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    if (user.role === 'branch-manager' || user.role === 'system-admin') {
      throw new Error('Cannot assign schedule to managers or admins')
    }

    if (user.branch_id && user.branch_id.toString() !== branchId.toString()) {
      throw new Error('User does not belong to this branch')
    }

    return user
  }

  // Check duplicate schedule
  async checkDuplicateSchedule(userId, date, shift) {
    const existing = await workScheduleRepository.checkDuplicateSchedule(userId, date, shift)
    return existing !== null
  }

  // Create single schedule
  async createSingleSchedule(data) {
    // Validate required fields
    if (!data.user_id || !data.branch_id || !data.date || !data.shift) {
      throw new Error('user_id, branch_id, date, and shift are required')
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(data.user_id)) {
      throw new Error('Invalid user_id')
    }

    if (!mongoose.Types.ObjectId.isValid(data.branch_id)) {
      throw new Error('Invalid branch_id')
    }

    if (data.created_by && !mongoose.Types.ObjectId.isValid(data.created_by)) {
      throw new Error('Invalid created_by')
    }

    // Validate date and shift format
    this.validateDateFormat(data.date)
    this.validateShift(data.shift)

    // Validate user
    await this.validateUser(data.user_id, data.branch_id)

    // Check duplicate
    const isDuplicate = await this.checkDuplicateSchedule(data.user_id, data.date, data.shift)
    if (isDuplicate) {
      throw new Error(`Employee already has a ${data.shift} shift on ${data.date}`)
    }

    return await workScheduleRepository.createWorkSchedule(data)
  }

  // Create week schedule
  async createWeekSchedule(data) {
    const { branch_id, created_by, from, to, schedules } = data

    // Validate required fields
    if (
      !branch_id ||
      !created_by ||
      !from ||
      !to ||
      !Array.isArray(schedules) ||
      schedules.length === 0
    ) {
      throw new Error('branch_id, created_by, from, to, and schedules array are required')
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(branch_id)) {
      throw new Error('Invalid branch_id')
    }

    if (!mongoose.Types.ObjectId.isValid(created_by)) {
      throw new Error('Invalid created_by')
    }

    // Validate date range
    this.validateDateFormat(from)
    this.validateDateFormat(to)

    if (from > to) {
      throw new Error('from date must be before to date')
    }

    // Validate and prepare schedules
    const schedulesToCreate = []
    const errors = []

    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i]
      const { user_id, date, shift, note = '' } = schedule

      // Validate required fields
      if (!user_id || !date || !shift) {
        errors.push(`Schedule ${i + 1}: user_id, date, and shift are required`)
        continue
      }

      // Validate date format
      try {
        this.validateDateFormat(date)
      } catch (error) {
        errors.push(`Schedule ${i + 1}: ${error.message}`)
        continue
      }

      // Check if date is within range (compare as YYYY-MM-DD strings)
      if (date < from || date > to) {
        errors.push(`Schedule ${i + 1}: Date ${date} is outside the specified range`)
        continue
      }

      // Validate shift format
      try {
        this.validateShift(shift)
      } catch (error) {
        errors.push(`Schedule ${i + 1}: ${error.message}`)
        continue
      }

      // Validate user_id ObjectId
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        errors.push(`Schedule ${i + 1}: Invalid user_id`)
        continue
      }

      // Validate user exists and belongs to branch
      try {
        await this.validateUser(user_id, branch_id)

        const isDuplicate = await this.checkDuplicateSchedule(user_id, date, shift)
        if (isDuplicate) {
          errors.push(`Schedule ${i + 1}: Employee already assigned to ${shift} shift on ${date}`)
          continue
        }

        schedulesToCreate.push({
          user_id,
          branch_id,
          date,
          shift,
          created_by,
          note: note || '',
        })
      } catch (error) {
        errors.push(`Schedule ${i + 1}: ${error.message}`)
        continue
      }
    }

    if (errors.length > 0 && schedulesToCreate.length === 0) {
      throw new Error(`Validation errors: ${errors.join('; ')}`)
    }

    if (schedulesToCreate.length === 0) {
      throw new Error('No valid schedules to create')
    }

    // Create all schedules
    const createdSchedules =
      await workScheduleRepository.createMultipleWorkSchedules(schedulesToCreate)

    return {
      total: schedulesToCreate.length,
      created: createdSchedules.length,
      errors: errors,
      schedules: createdSchedules,
    }
  }

  // Create or update day schedule
  async createOrUpdateDaySchedule(data) {
    const { branch_id, date, created_by, morning, afternoon } = data

    // Validate required fields
    if (!branch_id || !date || !created_by) {
      throw new Error('branch_id, date, and created_by are required')
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(branch_id)) {
      throw new Error('Invalid branch_id')
    }

    if (!mongoose.Types.ObjectId.isValid(created_by)) {
      throw new Error('Invalid created_by')
    }

    // Validate date
    this.validateDateFormat(date)

    // At least one shift must be provided
    if (!morning && !afternoon) {
      throw new Error('At least one of morning or afternoon shift must be specified')
    }

    const createdSchedules = []
    const errors = []

    // Handle morning shift
    if (morning) {
      if (!mongoose.Types.ObjectId.isValid(morning)) {
        errors.push('Invalid morning user_id')
      } else {
        try {
          await this.validateUser(morning, branch_id)

          // Check and remove existing morning schedule for this date
          const existing = await workScheduleRepository.checkDuplicateSchedule(
            morning,
            date,
            'morning'
          )
          if (existing) {
            await workScheduleRepository.deleteWorkSchedule(existing._id)
          }

          const schedule = await workScheduleRepository.createWorkSchedule({
            user_id: morning,
            branch_id,
            date,
            shift: 'morning',
            created_by,
            note: '',
          })
          createdSchedules.push(schedule)
        } catch (error) {
          errors.push(`Morning shift: ${error.message}`)
        }
      }
    }

    // Handle afternoon shift
    if (afternoon) {
      if (!mongoose.Types.ObjectId.isValid(afternoon)) {
        errors.push('Invalid afternoon user_id')
      } else {
        try {
          await this.validateUser(afternoon, branch_id)

          // Check and remove existing afternoon schedule for this date
          const existing = await workScheduleRepository.checkDuplicateSchedule(
            afternoon,
            date,
            'afternoon'
          )
          if (existing) {
            await workScheduleRepository.deleteWorkSchedule(existing._id)
          }

          const schedule = await workScheduleRepository.createWorkSchedule({
            user_id: afternoon,
            branch_id,
            date,
            shift: 'afternoon',
            created_by,
            note: '',
          })
          createdSchedules.push(schedule)
        } catch (error) {
          errors.push(`Afternoon shift: ${error.message}`)
        }
      }
    }

    if (createdSchedules.length === 0 && errors.length > 0) {
      throw new Error(`Failed to create schedules: ${errors.join('; ')}`)
    }

    return {
      date,
      created: createdSchedules.length,
      errors: errors,
      schedules: createdSchedules,
    }
  }

  // Get schedules by date range
  async getSchedulesByDateRange(branchId, from, to) {
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      throw new Error('Invalid branch_id')
    }

    this.validateDateFormat(from)
    this.validateDateFormat(to)

    const fromDate = new Date(from)
    const toDate = new Date(to)

    if (fromDate > toDate) {
      throw new Error('from date must be before to date')
    }

    return await workScheduleRepository.getWorkSchedulesByBranchIdAndDateRange(branchId, from, to)
  }

  // Get schedules by date
  async getSchedulesByDate(branchId, date) {
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      throw new Error('Invalid branch_id')
    }

    this.validateDateFormat(date)

    return await workScheduleRepository.getWorkSchedulesByBranchIdAndDate(branchId, date)
  }

  async getAllWorkSchedules() {
    return await workScheduleRepository.getAllWorkSchedules()
  }

  async getWorkScheduleById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid work schedule ID')
    }
    return await workScheduleRepository.getWorkScheduleById(id)
  }

  async getWorkSchedulesByUserId(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID')
    }
    return await workScheduleRepository.getWorkSchedulesByUserId(userId)
  }

  async updateWorkSchedule(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid work schedule ID')
    }
    return await workScheduleRepository.updateWorkSchedule(id, data)
  }

  async deleteWorkSchedule(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid work schedule ID')
    }
    return await workScheduleRepository.deleteWorkSchedule(id)
  }

  async getWorkSchedulesByBranchId(branchId) {
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      throw new Error('Invalid branch ID')
    }
    return await workScheduleRepository.getWorkSchedulesByBranchId(branchId)
  }

  // Get attendance history for employee with work schedule comparison
  async getAttendanceHistoryByEmployeeId(userId, page = 1, limit = 10) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID')
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10))

    return await workScheduleRepository.getAttendanceHistoryByEmployeeId(userId, pageNum, limitNum)
  }

  // Get attendance history for branch employees with work schedule comparison
  async getAttendanceHistoryByBranchId(branchId, page = 1, limit = 10, filters = {}) {
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      throw new Error('Invalid branch ID')
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10))

    // Validate filter dates if provided
    if (filters.from_date) {
      try {
        this.validateDateFormat(filters.from_date)
      } catch (error) {
        throw new Error(`Invalid from_date: ${error.message}`)
      }
    }

    if (filters.to_date) {
      try {
        this.validateDateFormat(filters.to_date)
      } catch (error) {
        throw new Error(`Invalid to_date: ${error.message}`)
      }
    }

    if (filters.from_date && filters.to_date && filters.from_date > filters.to_date) {
      throw new Error('from_date must be before to_date')
    }

    // Validate filter user_id if provided
    if (filters.user_id && !mongoose.Types.ObjectId.isValid(filters.user_id)) {
      throw new Error('Invalid user_id in filter')
    }

    // Validate status if provided
    if (
      filters.status &&
      !['checked_in', 'checked_out', 'late', 'early', 'absent'].includes(filters.status)
    ) {
      throw new Error('Status must be one of: checked_in, checked_out, late, early, absent')
    }

    return await workScheduleRepository.getAttendanceHistoryByBranchId(
      branchId,
      pageNum,
      limitNum,
      filters
    )
  }

  // Get attendance history for all branches (system-admin) with work schedule comparison
  async getAttendanceHistoryAll(page = 1, limit = 10, filters = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10))

    // Validate filter dates if provided
    if (filters.from_date) {
      try {
        this.validateDateFormat(filters.from_date)
      } catch (error) {
        throw new Error(`Invalid from_date: ${error.message}`)
      }
    }

    if (filters.to_date) {
      try {
        this.validateDateFormat(filters.to_date)
      } catch (error) {
        throw new Error(`Invalid to_date: ${error.message}`)
      }
    }

    if (filters.from_date && filters.to_date && filters.from_date > filters.to_date) {
      throw new Error('from_date must be before to_date')
    }

    // Validate filter user_id if provided
    if (filters.user_id && !mongoose.Types.ObjectId.isValid(filters.user_id)) {
      throw new Error('Invalid user_id in filter')
    }

    // Validate filter branch_id if provided
    if (filters.branch_id && !mongoose.Types.ObjectId.isValid(filters.branch_id)) {
      throw new Error('Invalid branch_id in filter')
    }

    // Validate status if provided
    if (
      filters.status &&
      !['checked_in', 'checked_out', 'late', 'early', 'absent'].includes(filters.status)
    ) {
      throw new Error('Status must be one of: checked_in, checked_out, late, early, absent')
    }

    return await workScheduleRepository.getAttendanceHistoryAll(pageNum, limitNum, filters)
  }

  // Get detailed attendance record with invoices created during this shift
  async getAttendanceDetailWithInvoices(attendanceId) {
    if (!attendanceId || attendanceId.length !== 24) {
      throw new Error('Invalid attendance ID')
    }

    const result = await workScheduleRepository.getAttendanceDetailWithInvoices(attendanceId)
    if (!result) {
      throw new Error('Attendance record not found')
    }

    return result
  }
}

export default new WorkScheduleService()
