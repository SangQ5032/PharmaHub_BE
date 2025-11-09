import attendanceRepository from './attendance.repository.js'
import mongoose from 'mongoose'

class AttendanceService {
  async getAllAttendances() {
    return await attendanceRepository.getAllAttendances()
  }

  async getAttendanceById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid attendance ID')
    }
    return await attendanceRepository.getAttendanceById(id)
  }

  async getAttendancesByUserId(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID')
    }
    return await attendanceRepository.getAttendancesByUserId(userId)
  }

  async getAttendancesByBranchId(branchId) {
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      throw new Error('Invalid branch ID')
    }
    return await attendanceRepository.getAttendancesByBranchId(branchId)
  }

  async checkin(userId, branchId, checkinTime) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID')
    }
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      throw new Error('Invalid branch ID')
    }

    // Kiểm tra xem user đã checkin chưa (chưa checkout)
    const activeCheckin = await attendanceRepository.findActiveCheckinByUserIdAnyDate(userId)
    if (activeCheckin) {
      throw new Error(
        'Bạn đã checkin nhưng chưa checkout. Vui lòng checkout trước khi checkin mới.'
      )
    }

    const attendanceData = {
      user_id: userId,
      branch_id: branchId,
      checkin_time: checkinTime || new Date().toISOString(),
      status: 'checked_in',
    }

    return await attendanceRepository.createAttendance(attendanceData)
  }

  async checkout(userId, checkoutTime) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID')
    }

    // Tìm attendance chưa checkout
    const activeCheckin = await attendanceRepository.findActiveCheckinByUserIdAnyDate(userId)
    if (!activeCheckin) {
      throw new Error('Bạn chưa checkin. Vui lòng checkin trước.')
    }

    const checkoutTimeValue = checkoutTime || new Date().toISOString()

    // Tính working_hours (tính bằng giờ)
    const checkinDate = new Date(activeCheckin.checkin_time)
    const checkoutDate = new Date(checkoutTimeValue)
    const diffMs = checkoutDate - checkinDate
    const workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100 // Làm tròn 2 chữ số thập phân

    const updateData = {
      checkout_time: checkoutTimeValue,
      working_hours: workingHours,
      status: 'checked_out',
    }

    return await attendanceRepository.updateAttendance(activeCheckin._id, updateData)
  }

  async createAttendance(data) {
    if (!data.user_id || !data.branch_id || !data.checkin_time) {
      throw new Error('user_id, branch_id, and checkin_time are required')
    }

    if (!mongoose.Types.ObjectId.isValid(data.user_id)) {
      throw new Error('Invalid user_id')
    }
    if (!mongoose.Types.ObjectId.isValid(data.branch_id)) {
      throw new Error('Invalid branch_id')
    }

    return await attendanceRepository.createAttendance(data)
  }

  async updateAttendance(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid attendance ID')
    }
    return await attendanceRepository.updateAttendance(id, data)
  }

  async deleteAttendance(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid attendance ID')
    }
    return await attendanceRepository.deleteAttendance(id)
  }
}

export default new AttendanceService()
