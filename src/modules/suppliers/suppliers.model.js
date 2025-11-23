// MODULE: SUPPLIERS - MODEL
// Định nghĩa schema cho nhà cung cấp trong MongoDB
import mongoose from 'mongoose'

const SupplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên nhà cung cấp là bắt buộc'],
      trim: true,
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
        sparse: true,
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
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'suppliers',
    versionKey: false,
  }
)

// Compound index để tìm kiếm và lọc nhanh
SupplierSchema.index({ name: 'text', 'contact.email': 'text' })
SupplierSchema.index({ status: 1, createdAt: -1 })

export const Supplier = mongoose.model('Supplier', SupplierSchema)
