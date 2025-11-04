import mongoose from 'mongoose'

const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  revenue_target: { type: Number, default: 0 },
})
const Branch = mongoose.model('Branch', BranchSchema)

export default Branch
