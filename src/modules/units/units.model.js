// MODULE: UNITS - MODEL (Mongoose Schema/Model)
// Mục đích: Định nghĩa cấu trúc dữ liệu của đơn vị (unit) trong MongoDB
import mongoose from 'mongoose'

const UnitSchema = new mongoose.Schema(
  {
    // Tên đơn vị (ví dụ: "Viên", "Hộp", "Lọ")
    name: {
      type: String,
      required: [true, 'Tên đơn vị là bắt buộc'],
      trim: true,
      index: true,
    },
    // Tên viết tắt (ví dụ: "viên", "hộp", "lọ")
    short_name: {
      type: String,
      required: [true, 'Tên viết tắt là bắt buộc'],
      trim: true,
      index: true,
    },
    // Tỷ lệ chuyển đổi so với đơn vị cơ sở (ví dụ: 1 hộp = 10 vỉ, thì ratio_to_base = 10)
    ratio_to_base: {
      type: Number,
      required: [true, 'Tỷ lệ chuyển đổi là bắt buộc'],
      min: [1, 'Tỷ lệ chuyển đổi phải >= 1'],
    },
  },
  {
    timestamps: true,
    collection: 'units',
  }
)

// Index để tìm kiếm nhanh
UnitSchema.index({ name: 1 })
UnitSchema.index({ short_name: 1 })

export const Unit = mongoose.model('Unit', UnitSchema)
