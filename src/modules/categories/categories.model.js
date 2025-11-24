// MODULE: CATEGORIES - MODEL (Mongoose Schema/Model)
// Mục đích: Định nghĩa cấu trúc dữ liệu của danh mục thuốc (category)
import mongoose from 'mongoose'

const CategorySchema = new mongoose.Schema(
  {
    // Tên danh mục
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true,
      unique: true,
      index: true,
    },
    // Mô tả danh mục
    description: {
      type: String,
      trim: true,
    },
    // Trạng thái
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'categories',
  }
)

export const Category = mongoose.model('Category', CategorySchema)
