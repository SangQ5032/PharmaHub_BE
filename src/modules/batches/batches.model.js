// MODULE: BATCHES - MODEL (Mongoose Schema/Model)
// Mục đích: Định nghĩa cấu trúc dữ liệu của lô thuốc (batch) trong MongoDB
import mongoose from 'mongoose'

const BatchSchema = new mongoose.Schema(
  {
    // Chi nhánh sở hữu lô thuốc này
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
    // Mã lô hàng (từ nhà cung cấp)
    batch_number: {
      type: String,
      required: [true, 'Mã lô hàng là bắt buộc'],
      trim: true,
    },
    // Ngày hết hạn
    expiry_date: {
      type: Date,
      required: [true, 'Ngày hết hạn là bắt buộc'],
    },
    // Giá nhập (đơn giá tính theo base unit)
    import_price: {
      type: Number,
      required: [true, 'Giá nhập là bắt buộc'],
      min: [0, 'Giá nhập phải lớn hơn hoặc bằng 0'],
    },
    // Số lượng tính theo base unit (tablet/viên) - quantity luôn lưu ở đơn vị nhỏ nhất
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [0, 'Số lượng phải lớn hơn hoặc bằng 0'],
    },
    // Số lượng tính theo base unit (alias của quantity để match với database schema)
    quantity_in_base_unit: {
      type: Number,
      min: [0, 'Số lượng phải lớn hơn hoặc bằng 0'],
    },
    // Số lượng ban đầu (khi nhập vào) - tính theo base unit
    initial_quantity: {
      type: Number,
      required: [true, 'Số lượng ban đầu là bắt buộc'],
      min: [1, 'Số lượng ban đầu phải lớn hơn 0'],
    },
    // Số lượng ban đầu tính theo base unit (alias của initial_quantity để match với database schema)
    initial_quantity_in_base_unit: {
      type: Number,
      min: [1, 'Số lượng ban đầu phải lớn hơn 0'],
    },
    // Giá bán lẻ tính theo base unit (viên)
    retail_price_for_base_unit: {
      type: Number,
      default: 0,
      min: [0, 'Giá bán phải >= 0'],
    },
    // Giá bán lẻ theo từng đơn vị (linh hoạt - hỗ trợ bất kỳ đơn vị nào từ package_structure)
    // Ví dụ: { box: 100000, blister: 10000, tablet: 1000 } hoặc { box: 150000, bottle: 30000, tablet: 2000 }
    retail_price_per_unit: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Nhà cung cấp
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Nhà cung cấp là bắt buộc'],
      index: true,
    },
    // Phiếu nhập hàng liên quan
    import_record_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Import',
      index: true,
    },
    // Trạng thái (active, discontinued, expired, ...)
    status: {
      type: String,
      enum: ['active', 'expired', 'discontinued', 'sold_out'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'batches',
  }
)

// Pre-save hook để đồng bộ quantity_in_base_unit với quantity
BatchSchema.pre('save', function (next) {
  // Đồng bộ quantity_in_base_unit với quantity
  if (this.quantity !== undefined) {
    this.quantity_in_base_unit = this.quantity
  }
  // Đồng bộ initial_quantity_in_base_unit với initial_quantity
  if (this.initial_quantity !== undefined) {
    this.initial_quantity_in_base_unit = this.initial_quantity
  }
  next()
})

// Index tổng hợp để tìm kiếm nhanh
BatchSchema.index({ branch_id: 1, medicine_id: 1 })
BatchSchema.index({ branch_id: 1, status: 1 })
BatchSchema.index({ batch_number: 1, branch_id: 1 })

export const Batch = mongoose.model('Batch', BatchSchema)
