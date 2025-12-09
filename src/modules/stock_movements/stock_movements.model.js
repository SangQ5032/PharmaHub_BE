// MODULE: STOCK_MOVEMENTS - MODEL (Mongoose Schema/Model)
// Mục đích: Định nghĩa cấu trúc dữ liệu lịch sử di chuyển kho trong MongoDB
import mongoose from 'mongoose'

const StockMovementSchema = new mongoose.Schema(
  {
    // Loại di chuyển: 'import', 'sale', 'adjustment', 'transfer', 'return'
    type: {
      type: String,
      required: [true, 'Loại di chuyển là bắt buộc'],
      enum: ['import', 'sale', 'adjustment', 'transfer', 'return', 'expired'],
      index: true,
    },
    // Chi nhánh
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Chi nhánh là bắt buộc'],
      index: true,
    },
    // Thuốc
    medicine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Thuốc là bắt buộc'],
      index: true,
    },
    // Lô hàng (có thể null nếu không liên quan đến batch cụ thể)
    batch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      index: true,
    },
    // Số lượng (tính theo base unit)
    // Dương nếu nhập, âm nếu xuất
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
    },
    // Tham chiếu (ví dụ: invoice_id, import_record_id, adjustment_id)
    reference: {
      type: String,
      trim: true,
      index: true,
    },
    // Ghi chú
    note: {
      type: String,
      trim: true,
    },
    // Người thực hiện (user_id)
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'stock_movements',
  }
)

// Index tổng hợp để tìm kiếm nhanh
StockMovementSchema.index({ branch_id: 1, medicine_id: 1, createdAt: -1 })
StockMovementSchema.index({ type: 1, createdAt: -1 })
StockMovementSchema.index({ batch_id: 1 })
StockMovementSchema.index({ reference: 1 })

export const StockMovement = mongoose.model('StockMovement', StockMovementSchema)
