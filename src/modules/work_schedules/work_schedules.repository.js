import WorkSchedule from './work_schedules.model.js'

class WorkScheduleRepository {
  async getAllWorkSchedules() {
    return await WorkSchedule.find()
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
      .sort({ date: -1, createdAt: -1 })
  }

  async getWorkScheduleById(id) {
    return await WorkSchedule.findById(id)
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
  }

  async getWorkSchedulesByUserId(userId) {
    return await WorkSchedule.find({ user_id: userId })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
      .sort({ date: -1, createdAt: -1 })
  }

  async createWorkSchedule(data) {
    const workSchedule = new WorkSchedule(data)
    return await workSchedule.save()
  }

  async createMultipleWorkSchedules(data) {
    return await WorkSchedule.insertMany(data)
  }

  async updateWorkSchedule(id, data) {
    return await WorkSchedule.findByIdAndUpdate(id, data, { new: true })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
  }

  async deleteWorkSchedule(id) {
    return await WorkSchedule.findByIdAndDelete(id)
  }

  async getWorkSchedulesByBranchId(branchId) {
    return await WorkSchedule.find({ branch_id: branchId })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
      .sort({ date: -1, createdAt: -1 })
  }

  async getWorkSchedulesByBranchIdAndDateRange(branchId, from, to) {
    return await WorkSchedule.find({
      branch_id: branchId,
      date: { $gte: from, $lte: to },
    })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
      .sort({ date: 1, shift: 1 })
  }

  async getWorkSchedulesByBranchIdAndDate(branchId, date) {
    return await WorkSchedule.find({
      branch_id: branchId,
      date: date,
    })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address')
      .populate('created_by', 'username name')
      .sort({ shift: 1 })
  }

  async checkDuplicateSchedule(userId, date, shift) {
    return await WorkSchedule.findOne({
      user_id: userId,
      date: date,
      shift: shift,
    })
  }

  async deleteByBranchIdAndDateRange(branchId, from, to) {
    return await WorkSchedule.deleteMany({
      branch_id: branchId,
      date: { $gte: from, $lte: to },
    })
  }

  async getWorkScheduleByUserIdAndDate(userId, date) {
    return await WorkSchedule.findOne({
      user_id: userId,
      date: date,
    })
      .populate('user_id', 'username name role')
      .populate('branch_id', 'name address location')
      .populate('created_by', 'username name')
  }
}

export default new WorkScheduleRepository()
