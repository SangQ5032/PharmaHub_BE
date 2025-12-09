// MODULE: BATCHES - MODEL (Mongoose Schema/Model)
// Mục đích: Định nghĩa cấu trúc dữ liệu của lô thuốc (batch) trong MongoDB
import mongoose from 'mongoose'

const BatchSchema = new mongoose.Schema(
  {
    // Thuốc trong lô
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Thuốc là bắt buộc'],
      index: true,
    },
    // Nhà cung cấp
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Nhà cung cấp là bắt buộc'],
      index: true,
    },
    // Mã lô hàng
    batch_code: {
      type: String,
      required: [true, 'Mã lô hàng là bắt buộc'],
      trim: true,
      index: true,
    },
    // Ngày hết hạn
    expiry_date: {
      type: Date,
      required: [true, 'Ngày hết hạn là bắt buộc'],
    },
    // Đơn vị (tham chiếu tới Unit)
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: [true, 'Đơn vị là bắt buộc'],
      index: true,
    },
    // Số lượng
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [0, 'Số lượng phải lớn hơn hoặc bằng 0'],
    },
    // Giá nhập
    import_price: {
      type: Number,
      required: [true, 'Giá nhập là bắt buộc'],
      min: [0, 'Giá nhập phải lớn hơn hoặc bằng 0'],
    },
    // Giá bán lẻ
    retail_price: {
      type: Number,
      required: [true, 'Giá bán lẻ là bắt buộc'],
      min: [0, 'Giá bán lẻ phải lớn hơn hoặc bằng 0'],
    },
  },
  {
    timestamps: true,
    collection: 'batches',
  }
)

// Index tổng hợp để tìm kiếm nhanh
BatchSchema.index({ medicine_id: 1 })
BatchSchema.index({ supplier_id: 1 })
BatchSchema.index({ batch_code: 1 })

export const Batch = mongoose.model('Batch', BatchSchema)
