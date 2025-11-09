import workScheduleService from './work_schedules.service.js'
import mongoose from 'mongoose'

class WorkScheduleController {
  async getAll(req, res, next) {
    try {
      const workSchedules = await workScheduleService.getAllWorkSchedules()
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

      const newWorkSchedule = await workScheduleService.createWorkSchedule(workScheduleData)
      res.status(201).json({
        success: true,
        data: newWorkSchedule,
      })
    } catch (error) {
      console.error('Error creating work schedule:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
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
