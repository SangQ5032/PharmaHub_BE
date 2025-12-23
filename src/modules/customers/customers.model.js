import mongoose from 'mongoose'

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên khách hàng là bắt buộc'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      trim: true,
    },
    total_spent: {
      type: Number,
      default: 0,
      min: [0, 'Tổng chi tiêu không hợp lệ'],
    },
    discount_balance: {
      type: Number,
      default: 0,
      min: [0, 'Số dư giảm giá không hợp lệ'],
      description: 'Số tiền giảm giá tích lũy (1% của total_spent)',
    },
  },
  {
    timestamps: true,
    collection: 'customers',
  }
)

const Customer = mongoose.model('Customer', CustomerSchema)

export default Customer
