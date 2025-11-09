import mongoose from 'mongoose'

const AttendanceSchema = new mongoose.Schema(
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
    checkin_time: {
      type: String,
      required: true,
    },
    checkout_time: {
      type: String,
      default: null,
    },
    working_hours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['checked_in', 'checked_out', 'late', 'early', 'absent'],
      default: 'checked_in',
    },
  },
  { timestamps: true }
)

// Index để tối ưu truy vấn
AttendanceSchema.index({ user_id: 1, createdAt: -1 })
AttendanceSchema.index({ branch_id: 1, createdAt: -1 })
AttendanceSchema.index({ user_id: 1, checkin_time: 1 })

const Attendance = mongoose.model('Attendance', AttendanceSchema, 'attendance')

export default Attendance
