import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    fullName: { type: String },
    phone: { type: String },
    email: { type: String },
    role: {
      type: String,
      enum: ['employee', 'branch-manager', 'system-admin', 'supplier-manager'],
      default: 'employee',
    },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const User = mongoose.model('User', UserSchema)
