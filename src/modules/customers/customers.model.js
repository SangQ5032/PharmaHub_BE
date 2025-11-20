// MODULE: CUSTOMERS - MODEL (Mongoose Schema/Model)
// Mục đích: Định nghĩa cấu trúc dữ liệu của khách hàng (customer) trong MongoDB
// - Chỉ mô tả dữ liệu và các chỉ mục/virtual cần thiết
// - Không chứa logic nghiệp vụ hay gọi DB trực tiếp ở đây
import mongoose from 'mongoose'

const CustomerSchema = new mongoose.Schema(
  {
    // Tên khách hàng
    name: {
      type: String,
      required: [true, 'Tên khách hàng là bắt buộc'],
      trim: true,
      index: true,
    },

    // Số điện thoại
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
      index: true,
    },

    // Địa chỉ (tùy chọn)
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // tự động thêm createdAt / updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Index text để hỗ trợ tìm kiếm nhanh theo nhiều trường
CustomerSchema.index({
  name: 'text',
  phone: 'text',
  address: 'text',
})

// Có thể thêm virtual fields sau này (VD: tổng chi tiêu, số lần mua hàng,...)

// Thêm field `total_spent` nếu chưa có (trường dữ liệu dạng Number)
if (!CustomerSchema.path('total_spent')) {
  CustomerSchema.add({
    total_spent: {
      type: Number,
      default: 0,
      min: 0,
    },
  })
}

export const Customer = mongoose.model('Customer', CustomerSchema)
