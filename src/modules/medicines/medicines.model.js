// MODULE: MEDICINES - MODEL (Mongoose Schema/Model)
// Mục đích: Định nghĩa cấu trúc dữ liệu của thuốc (medicine) trong MongoDB
// - Chỉ mô tả dữ liệu và các chỉ mục/virtual cần thiết
// - Không chứa logic nghiệp vụ hay gọi DB trực tiếp ở đây
import mongoose from 'mongoose'

const MedicineSchema = new mongoose.Schema(
  {
    // Tên thuốc - dùng để hiển thị, tìm kiếm
    name: {
      type: String,
      required: [true, 'Tên thuốc là bắt buộc'],
      trim: true,
      index: true,
    },
    // Mô tả ngắn gọn công dụng/ghi chú
    description: {
      type: String,
      trim: true,
    },
    // Nhóm/loại thuốc (VD: Kháng sinh/Giảm đau/...)
    category: {
      type: String,
      required: [true, 'Phân loại thuốc là bắt buộc'],
      trim: true,
      index: true,
    },
    // Đơn vị tính (viên, hộp, chai, ...)
    unit: {
      type: String,
      required: [true, 'Đơn vị tính là bắt buộc'],
      trim: true,
    },
    // Giá bán lẻ
    price: {
      type: Number,
      required: [true, 'Giá bán là bắt buộc'],
      min: [0, 'Giá bán phải lớn hơn 0'],
    },
    // Hạn sử dụng
    expiry_date: {
      type: Date,
      required: [true, 'Hạn sử dụng là bắt buộc'],
    },
    // Tham chiếu tới nhà cung cấp
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Nhà cung cấp là bắt buộc'],
      index: true,
    },
    // Ngưỡng cảnh báo tồn kho (VD: < 50 thì cảnh báo)
    warning_threshold: {
      type: Number,
      default: 50,
      min: [0, 'Ngưỡng cảnh báo phải lớn hơn hoặc bằng 0'],
    },
    // Hãng sản xuất (nếu có)
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

// Index text cho phép tìm kiếm nhanh theo tên/mô tả
MedicineSchema.index({ name: 'text', description: 'text' })

// Virtual field: true nếu thuốc sắp hết hạn (<= 3 tháng tới)
MedicineSchema.virtual('isExpiringSoon').get(function () {
  const today = new Date()
  const threeMonthsLater = new Date(today.setMonth(today.getMonth() + 3))
  return this.expiry_date <= threeMonthsLater
})

// Virtual field: true nếu đã hết hạn
MedicineSchema.virtual('isExpired').get(function () {
  return this.expiry_date < new Date()
})

export const Medicine = mongoose.model('Medicine', MedicineSchema)
