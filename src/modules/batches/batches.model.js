// MODULE: BATCHES - MODEL (Mongoose Schema/Model)
// Mục đích: Định nghĩa cấu trúc dữ liệu của lô thuốc (batch) trong MongoDB
import mongoose from 'mongoose'

const BatchSchema = new mongoose.Schema(
  {
    // Chi nhánh
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Chi nhánh là bắt buộc'],
      index: true,
    },
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
    // Phiếu nhập (tham chiếu tới Import Record)
    import_record_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Import',
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
    // Đơn vị (tham chiếu tới Unit) - thường là base_unit của medicine
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: [true, 'Đơn vị là bắt buộc'],
      index: true,
    },
    // Số lượng (tính theo base unit)
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [0, 'Số lượng phải lớn hơn hoặc bằng 0'],
    },
    // Số lượng ban đầu khi nhập (để theo dõi)
    initial_quantity: {
      type: Number,
      required: [true, 'Số lượng ban đầu là bắt buộc'],
      min: [0, 'Số lượng ban đầu phải lớn hơn hoặc bằng 0'],
    },
    // Giá nhập (tính theo base unit)
    import_price: {
      type: Number,
      required: [true, 'Giá nhập là bắt buộc'],
      min: [0, 'Giá nhập phải lớn hơn hoặc bằng 0'],
    },
    // Giá bán lẻ (tính theo base unit)
    retail_price: {
      type: Number,
      required: [true, 'Giá bán lẻ là bắt buộc'],
      min: [0, 'Giá bán lẻ phải lớn hơn hoặc bằng 0'],
    },
    // Trạng thái lô hàng
    status: {
      type: String,
      enum: ['active', 'expired', 'sold_out', 'cancelled'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'batches',
  }
)

// Index tổng hợp để tìm kiếm nhanh
BatchSchema.index({ branch_id: 1, medicine_id: 1 })
BatchSchema.index({ medicine_id: 1 })
BatchSchema.index({ supplier_id: 1 })
BatchSchema.index({ batch_code: 1 })
BatchSchema.index({ status: 1 })
BatchSchema.index({ expiry_date: 1 })

export const Batch = mongoose.model('Batch', BatchSchema)
