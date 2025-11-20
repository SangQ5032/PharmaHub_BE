import mongoose from 'mongoose'

const ContactSchema = new mongoose.Schema(
  {
    phone: { type: String },
    email: { type: String },
  },
  { _id: false }
)

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    password_hash: { type: String, required: true },
    name: { type: String },
    role: {
      type: String,
      enum: ['employee', 'branch-manager', 'system-admin', 'supplier-manager'],
      default: 'employee',
    },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
    contact: { type: ContactSchema, default: {} },
    salary: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
  },
  { timestamps: true }
)

export const User = mongoose.model('User', UserSchema)

// Backwards-compatible virtuals for existing code that expects older field names
UserSchema.virtual('phone').get(function () {
  return this.contact && this.contact.phone
})

UserSchema.virtual('fullName').get(function () {
  return this.name
})

UserSchema.virtual('branchId').get(function () {
  return this.branch_id
})

UserSchema.virtual('password').get(function () {
  return this.password_hash
})

// Include virtuals when converting to JSON / Object
UserSchema.set('toObject', { virtuals: true })
UserSchema.set('toJSON', { virtuals: true })
