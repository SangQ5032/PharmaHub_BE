import workScheduleRepository from './work_schedules.repository.js'
import mongoose from 'mongoose'

class WorkScheduleService {
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

  async createWorkSchedule(data) {
    // Validate required fields
    if (!data.user_id || !data.branch_id || !data.date || !data.shift) {
      throw new Error('user_id, branch_id, date, and shift are required')
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.user_id)) {
      throw new Error('Invalid user_id')
    }
    if (!mongoose.Types.ObjectId.isValid(data.branch_id)) {
      throw new Error('Invalid branch_id')
    }
    if (data.created_by && !mongoose.Types.ObjectId.isValid(data.created_by)) {
      throw new Error('Invalid created_by')
    }

    return await workScheduleRepository.createWorkSchedule(data)
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
}

export default new WorkScheduleService()
