import workScheduleService from './work_schedules.service.js'
import mongoose from 'mongoose'

class WorkScheduleController {
  // Create schedule for a single day (morning/afternoon)
  async createDaySchedule(req, res, next) {
    try {
      const { branch_id, date, morning, afternoon } = req.body
      const created_by = req.user._id

      if (!branch_id || !date) {
        return res.status(400).json({
          success: false,
          message: 'branch_id and date are required',
        })
      }

      const result = await workScheduleService.createOrUpdateDaySchedule({
        branch_id,
        date,
        created_by,
        morning,
        afternoon,
      })

      return res.status(201).json({
        success: true,
        message: `Created schedules for ${date}`,
        data: result,
      })
    } catch (error) {
      console.error('Error creating day schedule:', error)
      return res.status(400).json({
        success: false,
        message: error.message || 'Internal server error',
      })
    }
  }

  // Create schedule for a whole week
  async createWeekSchedule(req, res, next) {
    try {
      const { branch_id, from, to, schedules } = req.body
      const created_by = req.user._id

      if (!branch_id || !from || !to || !schedules) {
        return res.status(400).json({
          success: false,
          message: 'branch_id, from, to, and schedules are required',
        })
      }

      const result = await workScheduleService.createWeekSchedule({
        branch_id,
        created_by,
        from,
        to,
        schedules,
      })

      return res.status(201).json({
        success: true,
        message: `Created ${result.total} schedules`,
        data: result,
      })
    } catch (error) {
      console.error('Error creating week schedule:', error)
      return res.status(400).json({
        success: false,
        message: error.message || 'Internal server error',
      })
    }
  }

  // Get schedules by week
  async getWeekSchedules(req, res, next) {
    try {
      const { branch_id, from, to } = req.query

      if (!branch_id || !from || !to) {
        return res.status(400).json({
          success: false,
          message: 'branch_id, from, and to query parameters are required',
        })
      }

      const schedules = await workScheduleService.getSchedulesByDateRange(branch_id, from, to)

      return res.status(200).json({
        success: true,
        message: 'Retrieved week schedules',
        total: schedules.length,
        data: schedules,
      })
    } catch (error) {
      console.error('Error getting week schedules:', error)
      return res.status(400).json({
        success: false,
        message: error.message || 'Internal server error',
      })
    }
  }

  // Get schedules by day
  async getDaySchedules(req, res, next) {
    try {
      const { branch_id, date } = req.query

      if (!branch_id || !date) {
        return res.status(400).json({
          success: false,
          message: 'branch_id and date query parameters are required',
        })
      }

      const schedules = await workScheduleService.getSchedulesByDate(branch_id, date)

      return res.status(200).json({
        success: true,
        message: `Retrieved schedules for ${date}`,
        total: schedules.length,
        data: schedules,
      })
    } catch (error) {
      console.error('Error getting day schedules:', error)
      return res.status(400).json({
        success: false,
        message: error.message || 'Internal server error',
      })
    }
  }

  async getAll(req, res, next) {
    try {
      // Lấy branch_id từ user hiện tại
      const user = req.user
      const userRole = user.role || (req.tokenPayload && req.tokenPayload.role) || ''
      const tokenRole = String(userRole).toLowerCase().replace(/_/g, '-')
      let branchId = user.branch_id

      // Allow system-admin to specify branch_id via query param
      if (!branchId && tokenRole === 'system-admin') {
        branchId = req.query.branch_id || req.query.branchId
      }

      if (!branchId) {
        return res.status(400).json({
          success: false,
          message: 'User does not have a branch assigned',
        })
      }

      const workSchedules = await workScheduleService.getWorkSchedulesByBranchId(branchId)
      res.status(200).json({
        success: true,
        data: workSchedules,
      })
    } catch (error) {
      console.error('Error getting work schedules:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
    }
  }

  async getMySchedule(req, res, next) {
    try {
      const userId = req.user._id
      const workSchedules = await workScheduleService.getWorkSchedulesByUserId(userId)
      res.status(200).json({
        success: true,
        data: workSchedules,
      })
    } catch (error) {
      console.error('Error getting my work schedule:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
    }
  }

  async getByBranchId(req, res, next) {
    try {
      const { branchId } = req.params

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID',
        })
      }

      const workSchedules = await workScheduleService.getWorkSchedulesByBranchId(branchId)
      res.status(200).json({
        success: true,
        data: workSchedules,
      })
    } catch (error) {
      console.error('Error getting work schedules by branch:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
    }
  }

  async create(req, res, next) {
    try {
      const { user_id, branch_id, date, shift } = req.body

      if (!user_id || !branch_id || !date || !shift) {
        return res.status(400).json({
          success: false,
          message: 'user_id, branch_id, date, and shift are required',
        })
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user_id',
        })
      }

      if (!mongoose.Types.ObjectId.isValid(branch_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch_id',
        })
      }

      // Lấy user_id từ token để set created_by
      const created_by = req.user._id

      const workScheduleData = {
        user_id,
        branch_id,
        date,
        shift,
        created_by,
      }

      const newWorkSchedule = await workScheduleService.createSingleSchedule(workScheduleData)
      res.status(201).json({
        success: true,
        data: newWorkSchedule,
      })
    } catch (error) {
      console.error('Error creating work schedule:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Internal server error',
      })
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid work schedule ID',
        })
      }

      const workSchedule = await workScheduleService.getWorkScheduleById(id)
      if (!workSchedule) {
        return res.status(404).json({
          success: false,
          message: 'Work schedule not found',
        })
      }

      res.status(200).json({
        success: true,
        data: workSchedule,
      })
    } catch (error) {
      console.error('Error getting work schedule:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid work schedule ID',
        })
      }

      const updated = await workScheduleService.updateWorkSchedule(id, req.body)
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Work schedule not found',
        })
      }

      res.status(200).json({
        success: true,
        data: updated,
      })
    } catch (error) {
      console.error('Error updating work schedule:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid work schedule ID',
        })
      }

      const deleted = await workScheduleService.deleteWorkSchedule(id)
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Work schedule not found',
        })
      }

      res.status(200).json({
        success: true,
        message: 'Work schedule deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting work schedule:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
    }
  }

  // Get attendance history for employee (their own attendance records)
  async getMyAttendanceHistory(req, res, next) {
    try {
      const userId = req.user._id
      const page = req.query.page || 1
      const limit = req.query.limit || 10

      // Build filters from query parameters
      const filters = {}
      if (req.query.from_date) filters.from_date = req.query.from_date
      if (req.query.to_date) filters.to_date = req.query.to_date
      if (req.query.search) filters.search = req.query.search
      if (req.query.shift) filters.shift = req.query.shift
      if (req.query.status) filters.status = req.query.status

      const result = await workScheduleService.getAttendanceHistoryByEmployeeId(
        userId,
        page,
        limit,
        filters
      )

      res.status(200).json({
        success: true,
        message: 'Retrieved attendance history for current employee with schedule comparison',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      })
    } catch (error) {
      console.error('Error getting attendance history:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Internal server error',
      })
    }
  }

  // Get attendance history for branch employees (branch-manager)
  async getBranchEmployeesAttendanceHistory(req, res, next) {
    try {
      const user = req.user
      const branchId = user.branch_id

      if (!branchId) {
        return res.status(400).json({
          success: false,
          message: 'User does not have a branch assigned',
        })
      }

      const page = req.query.page || 1
      const limit = req.query.limit || 10

      // Build filters from query parameters
      const filters = {}
      if (req.query.from_date) filters.from_date = req.query.from_date
      if (req.query.to_date) filters.to_date = req.query.to_date
      if (req.query.user_id) filters.user_id = req.query.user_id
      if (req.query.status) filters.status = req.query.status

      const result = await workScheduleService.getAttendanceHistoryByBranchId(
        branchId,
        page,
        limit,
        filters
      )

      res.status(200).json({
        success: true,
        message: 'Retrieved attendance history for branch employees with schedule comparison',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      })
    } catch (error) {
      console.error('Error getting branch employees attendance history:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Internal server error',
      })
    }
  }

  // Get attendance history for all branches (system-admin)
  async getAllAttendanceHistory(req, res, next) {
    try {
      const page = req.query.page || 1
      const limit = req.query.limit || 10

      // Build filters from query parameters
      const filters = {}
      if (req.query.from_date) filters.from_date = req.query.from_date
      if (req.query.to_date) filters.to_date = req.query.to_date
      if (req.query.user_id) filters.user_id = req.query.user_id
      if (req.query.branch_id) filters.branch_id = req.query.branch_id
      if (req.query.status) filters.status = req.query.status

      const result = await workScheduleService.getAttendanceHistoryAll(page, limit, filters)

      res.status(200).json({
        success: true,
        message: 'Retrieved all attendance history with schedule comparison',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      })
    } catch (error) {
      console.error('Error getting all attendance history:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Internal server error',
      })
    }
  }

  // Get detailed attendance record with invoices created during this shift
  async getAttendanceDetailWithInvoices(req, res, next) {
    try {
      const { attendanceId } = req.params

      if (!attendanceId) {
        return res.status(400).json({
          success: false,
          message: 'Attendance ID is required',
        })
      }

      const result = await workScheduleService.getAttendanceDetailWithInvoices(attendanceId)

      res.status(200).json({
        success: true,
        message: 'Retrieved attendance detail with invoices',
        data: result,
      })
    } catch (error) {
      console.error('Error getting attendance detail:', error)
      const statusCode = error.message.includes('not found') ? 404 : 400
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Internal server error',
      })
    }
  }
}

export default new WorkScheduleController()
