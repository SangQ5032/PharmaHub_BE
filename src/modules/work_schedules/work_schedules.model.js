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
    },
    shift: {
      type: String,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

// Index để tối ưu truy vấn
WorkScheduleSchema.index({ user_id: 1, date: 1 })
WorkScheduleSchema.index({ branch_id: 1, date: 1 })

const WorkSchedule = mongoose.model('WorkSchedule', WorkScheduleSchema, 'work_schedules')

export default WorkSchedule
