import attendanceService from './attendance.service.js'
import mongoose from 'mongoose'

class AttendanceController {
  async getAll(req, res, next) {
    try {
      const attendances = await attendanceService.getAllAttendances()
      res.status(200).json({
        success: true,
        data: attendances,
      })
    } catch (error) {
      console.error('Error getting attendances:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
    }
  }

  async getMyAttendance(req, res, next) {
    try {
      const userId = req.user._id
      const attendances = await attendanceService.getAttendancesByUserId(userId)
      res.status(200).json({
        success: true,
        data: attendances,
      })
    } catch (error) {
      console.error('Error getting my attendance:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
    }
  }

  async checkin(req, res, next) {
    try {
      const userId = req.user._id
      const { branch_id, checkin_time, latitude, longitude } = req.body

      // Nếu không có branch_id trong body, lấy từ user (token hoặc profile)
      const branchId = branch_id || req.user.branch_id || req.user.branchId

      if (!branchId) {
        return res.status(400).json({
          success: false,
          message: 'branch_id is required. User must be assigned to a branch.',
        })
      }

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch_id',
        })
      }

      // Kiểm tra latitude và longitude
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cấp quyền truy cập vị trí',
        })
      }

      const attendance = await attendanceService.checkin(
        userId,
        branchId,
        latitude,
        longitude,
        checkin_time
      )
      res.status(201).json({
        success: true,
        message: 'Checkin thành công',
        data: attendance,
      })
    } catch (error) {
      console.error('Error checking in:', error)
      // Xử lý các lỗi cụ thể
      if (
        error.message.includes('đã checkin') ||
        error.message.includes('chưa checkout') ||
        error.message.includes('lịch làm việc') ||
        error.message.includes('vị trí') ||
        error.message.includes('cửa hàng') ||
        error.message.includes('cấp quyền')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        })
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
    }
  }

  async checkout(req, res, next) {
    try {
      const userId = req.user._id
      const { checkout_time } = req.body

      const attendance = await attendanceService.checkout(userId, checkout_time)
      res.status(200).json({
        success: true,
        message: 'Checkout thành công',
        data: attendance,
      })
    } catch (error) {
      console.error('Error checking out:', error)
      if (error.message.includes('chưa checkin') || error.message.includes('chưa checkout')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        })
      }
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
          message: 'Invalid attendance ID',
        })
      }

      const attendance = await attendanceService.getAttendanceById(id)
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance not found',
        })
      }

      res.status(200).json({
        success: true,
        data: attendance,
      })
    } catch (error) {
      console.error('Error getting attendance:', error)
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
          message: 'Invalid attendance ID',
        })
      }

      const updated = await attendanceService.updateAttendance(id, req.body)
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Attendance not found',
        })
      }

      res.status(200).json({
        success: true,
        data: updated,
      })
    } catch (error) {
      console.error('Error updating attendance:', error)
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
          message: 'Invalid attendance ID',
        })
      }

      const deleted = await attendanceService.deleteAttendance(id)
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Attendance not found',
        })
      }

      res.status(200).json({
        success: true,
        message: 'Attendance deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting attendance:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
    }
  }
}

export default new AttendanceController()
