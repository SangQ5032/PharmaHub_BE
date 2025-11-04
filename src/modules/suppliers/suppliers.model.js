import mongoose from 'mongoose'

const SupplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên nhà cung cấp là bắt buộc'],
      trim: true,
      unique: true,
      index: true,
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Số điện thoại là bắt buộc'],
        trim: true,
        match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'],
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
      },
      address: {
        type: String,
        required: [true, 'Địa chỉ là bắt buộc'],
        trim: true,
      },
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'suppliers',
  }
)

// Index để tìm kiếm nhanh
SupplierSchema.index({ name: 'text' })

export const Supplier = mongoose.model('Supplier', SupplierSchema)

