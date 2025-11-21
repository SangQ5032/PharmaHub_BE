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
      const branchId = req.user.branch_id

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
}

export default new WorkScheduleController()
