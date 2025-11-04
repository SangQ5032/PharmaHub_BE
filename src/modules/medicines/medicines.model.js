import mongoose from 'mongoose'

const MedicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên thuốc là bắt buộc'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Phân loại thuốc là bắt buộc'],
      trim: true,
      index: true,
    },
    unit: {
      type: String,
      required: [true, 'Đơn vị tính là bắt buộc'],
      enum: ['Viên', 'Hộp', 'Chai', 'Tuýp', 'Gói', 'Ống'],
      default: 'Viên',
    },
    price: {
      type: Number,
      required: [true, 'Giá bán là bắt buộc'],
      min: [0, 'Giá bán phải lớn hơn 0'],
    },
    expiry_date: {
      type: Date,
      required: [true, 'Hạn sử dụng là bắt buộc'],
    },
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Nhà cung cấp là bắt buộc'],
      index: true,
    },
    warning_threshold: {
      type: Number,
      default: 50,
      min: [0, 'Ngưỡng cảnh báo phải lớn hơn hoặc bằng 0'],
    },
    manufacturer: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'medicines',
  }
)

// Index để tìm kiếm nhanh
MedicineSchema.index({ name: 'text', description: 'text' })

// Virtual để kiểm tra thuốc sắp hết hạn
MedicineSchema.virtual('isExpiringSoon').get(function () {
  const today = new Date()
  const threeMonthsLater = new Date(today.setMonth(today.getMonth() + 3))
  return this.expiry_date <= threeMonthsLater
})

// Virtual để kiểm tra thuốc đã hết hạn
MedicineSchema.virtual('isExpired').get(function () {
  return this.expiry_date < new Date()
})

export const Medicine = mongoose.model('Medicine', MedicineSchema)

