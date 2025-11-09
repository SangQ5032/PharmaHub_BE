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
}

export default new WorkScheduleRepository()
