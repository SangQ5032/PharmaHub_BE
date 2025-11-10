import Attendance from './attendance.model.js'

class AttendanceRepository {
  async getAllAttendances() {
    return await Attendance.find()
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .sort({ createdAt: -1 })
  }

  async getAttendanceById(id) {
    return await Attendance.findById(id)
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
  }

  async getAttendancesByUserId(userId) {
    return await Attendance.find({ user_id: userId })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .sort({ createdAt: -1 })
  }

  async getAttendancesByBranchId(branchId) {
    return await Attendance.find({ branch_id: branchId })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .sort({ createdAt: -1 })
  }

  async createAttendance(data) {
    const attendance = new Attendance(data)
    return await attendance.save()
  }

  async updateAttendance(id, data) {
    return await Attendance.findByIdAndUpdate(id, data, { new: true })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
  }

  async deleteAttendance(id) {
    return await Attendance.findByIdAndDelete(id)
  }

  // Tìm attendance chưa checkout của user trong ngày
  async findActiveCheckinByUserId(userId, date) {
    // Tìm attendance có checkout_time = null và checkin_time bắt đầu bằng date
    return await Attendance.findOne({
      user_id: userId,
      checkout_time: null,
      checkin_time: { $regex: `^${date}` },
    })
  }

  // Tìm attendance chưa checkout của user (bất kỳ ngày nào)
  async findActiveCheckinByUserIdAnyDate(userId) {
    return await Attendance.findOne({
      user_id: userId,
      checkout_time: null,
    }).sort({ createdAt: -1 })
  }
}

export default new AttendanceRepository()
