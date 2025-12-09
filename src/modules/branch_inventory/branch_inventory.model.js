// MODULE: BRANCH_INVENTORY - MODEL (Mongoose Schema/Model)
// Mục đích: Định nghĩa cấu trúc dữ liệu tồn kho theo chi nhánh trong MongoDB
import mongoose from 'mongoose'

const BranchInventorySchema = new mongoose.Schema(
  {
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
    // Danh sách lô hàng (array of ObjectId tham chiếu tới Batch)
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
      },
    ],
  },
  {
    timestamps: true,
    collection: 'branch_inventory',
  }
)

// Compound index để đảm bảo mỗi thuốc chỉ có 1 record trong 1 chi nhánh
BranchInventorySchema.index({ branch_id: 1, medicine_id: 1 }, { unique: true })

export const BranchInventory = mongoose.model('BranchInventory', BranchInventorySchema)
