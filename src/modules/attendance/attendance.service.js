import attendanceRepository from './attendance.repository.js'
import workScheduleRepository from '../work_schedules/work_schedules.repository.js'
import Branch from '../branch/branch.model.js'
import mongoose from 'mongoose'

/**
 * Hàm tính khoảng cách giữa 2 điểm trên Trái Đất (km)
 * Sử dụng công thức Haversine
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance * 1000 // Chuyển thành mét
}

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

  /**
   * Checkin với xác thực:
   * 1. Kiểm tra user có công việc hôm nay không
   * 2. Kiểm tra vị trí GPS nằm trong bán kính branch không
   * 3. Kiểm tra user chưa checkout từ lần checkin trước
   */
  async checkin(userId, branchId, latitude, longitude, checkinTime) {
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

    // Lấy ngày hôm nay ở định dạng YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0]

    // Xác định shift từ thời gian check-in hiện tại
    const checkinDateTime = checkinTime ? new Date(checkinTime) : new Date()
    const checkinHour = checkinDateTime.getHours()
    const shift = checkinHour < 12 ? 'morning' : 'afternoon'

    // Kiểm tra user có công việc vào shift cụ thể hôm nay không
    const workSchedule = await workScheduleRepository.checkDuplicateSchedule(userId, today, shift)
    if (!workSchedule) {
      throw new Error(
        `Bạn không có lịch làm việc ${shift === 'morning' ? 'ca sáng' : 'ca chiều'} hôm nay`
      )
    }

    // Lấy thông tin chi nhánh
    const branch = await Branch.findById(branchId)
    if (!branch) {
      throw new Error('Chi nhánh không tồn tại')
    }

    // Kiểm tra xem chi nhánh có cấu hình vị trí không
    if (!branch.location || !branch.location.latitude || !branch.location.longitude) {
      throw new Error('Chi nhánh chưa cấu hình vị trí')
    }

    // Kiểm tra xem radius có được cấu hình không
    if (!branch.location.radius || branch.location.radius <= 0) {
      throw new Error('Chi nhánh chưa cấu hình bán kính cho phép')
    }

    // Kiểm tra xem latitude, longitude có được gửi không
    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
    ) {
      throw new Error('Vui lòng cấp quyền truy cập vị trí')
    }

    // Validate latitude và longitude có nằm trong khoảng hợp lệ không
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error('Tọa độ GPS không hợp lệ')
    }

    // Tính khoảng cách từ vị trí hiện tại đến chi nhánh
    const distance = calculateDistance(
      latitude,
      longitude,
      branch.location.latitude,
      branch.location.longitude
    )

    // Kiểm tra xem user có nằm trong bán kính cho phép không
    if (distance > branch.location.radius) {
      throw new Error(
        `Bạn chưa tới cửa hàng. Khoảng cách hiện tại: ${Math.round(distance)}m, bán kính cho phép: ${branch.location.radius}m`
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
