import { default as Payroll } from './payroll.model.js'
import mongoose from 'mongoose'

class PayrollRepository {
  // Create new payroll
  async create(payrollData) {
    const payroll = new Payroll(payrollData)
    return await payroll.save()
  }

  // Find by ID
  async findById(id) {
    return await Payroll.findById(id)
      .populate('user_id', 'name username contact')
      .populate('branch_id', 'name address')
      .populate('approved_by', 'name username')
  }

  // Find by user_id and month
  async findByUserAndMonth(user_id, month) {
    return await Payroll.findOne({ user_id, month })
      .populate('user_id', 'name username contact')
      .populate('branch_id', 'name address')
      .populate('approved_by', 'name username')
  }

  // Find all with filters
  async findAll(filters = {}) {
    const query = Payroll.find(filters)
    return await query
      .populate('user_id', 'name username contact')
      .populate('branch_id', 'name address')
      .populate('approved_by', 'name username')
      .sort({ createdAt: -1 })
  }

  // Find with pagination
  async findWithPagination(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      Payroll.find(filters)
        .populate('user_id', 'name username contact')
        .populate('branch_id', 'name address')
        .populate('approved_by', 'name username')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Payroll.countDocuments(filters),
    ])
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Update by ID
  async updateById(id, updateData) {
    return await Payroll.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('user_id', 'name username contact')
      .populate('branch_id', 'name address')
      .populate('approved_by', 'name username')
  }

  // Update status
  async updateStatus(id, status, approvedBy = null) {
    const updateData = {
      status,
      approved_by: approvedBy,
      approved_at: new Date(),
    }
    return await this.updateById(id, updateData)
  }

  // Delete by ID
  async deleteById(id) {
    return await Payroll.findByIdAndDelete(id)
  }

  // Check if payroll already exists
  async exists(user_id, month) {
    return await Payroll.findOne({ user_id, month })
  }

  // Get payroll summary for branch
  async getBranchSummary(branch_id, month) {
    return await Payroll.aggregate([
      {
        $match: {
          branch_id: mongoose.Types.ObjectId(branch_id),
          month,
        },
      },
      {
        $group: {
          _id: null,
          total_payroll: { $sum: '$final_salary' },
          count: { $sum: 1 },
          approved_count: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, 1, 0],
            },
          },
          pending_count: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
            },
          },
          rejected_count: {
            $sum: {
              $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0],
            },
          },
        },
      },
    ])
  }
}

export default new PayrollRepository()
