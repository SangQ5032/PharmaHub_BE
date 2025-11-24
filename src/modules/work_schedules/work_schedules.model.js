import mongoose from 'mongoose'

const WorkScheduleSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
        message: 'Date must be in YYYY-MM-DD format',
      },
    },
    shift: {
      type: String,
      required: true,
      enum: ['morning', 'afternoon'],
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

// Index để tối ưu truy vấn và đảm bảo không trùng lịch
WorkScheduleSchema.index({ user_id: 1, date: 1, shift: 1 }, { unique: true })
WorkScheduleSchema.index({ branch_id: 1, date: 1 })
WorkScheduleSchema.index({ branch_id: 1, date: 1, shift: 1 })

const WorkSchedule = mongoose.model('WorkSchedule', WorkScheduleSchema, 'work_schedules')

export default WorkSchedule
