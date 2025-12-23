import mongoose from 'mongoose'

const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  revenue_target: { type: Number, default: 0 },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Vĩ độ của chi nhánh là bắt buộc'],
      min: [-90, 'Vĩ độ phải từ -90 đến 90'],
      max: [90, 'Vĩ độ phải từ -90 đến 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Kinh độ của chi nhánh là bắt buộc'],
      min: [-180, 'Kinh độ phải từ -180 đến 180'],
      max: [180, 'Kinh độ phải từ -180 đến 180'],
    },
    radius: {
      type: Number,
      required: [true, 'Bán kính cho phép cho checkin là bắt buộc'],
      min: [0, 'Bán kính phải > 0 (tính bằng mét)'],
    },
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  },
})
const Branch = mongoose.model('Branch', BranchSchema)

export default Branch
