import mongoose from 'mongoose'

const payrollSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    month: {
      type: String,
      required: true, // Format: YYYY-MM
      match: /^\d{4}-\d{2}$/,
    },
    base_salary: {
      type: Number,
      required: true,
      min: 0,
    },
    total_shifts: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed_shifts: {
      type: Number,
      default: 0,
      min: 0,
    },
    late_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    penalty_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bonus_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    sales_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    final_salary: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    note: {
      type: String,
      default: '',
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approved_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient querying
payrollSchema.index({ user_id: 1, month: 1 }, { unique: true })
payrollSchema.index({ branch_id: 1, month: 1 })
payrollSchema.index({ status: 1 })

export default mongoose.model('Payroll', payrollSchema)
