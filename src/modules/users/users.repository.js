import { User } from './users.model.js'
import mongoose from 'mongoose'

export const findAll = () => {
  return User.find().lean()
}

export const findByBranchId = (branchId) => {
  const objectId = new mongoose.Types.ObjectId(branchId)
  return User.find({ branch_id: objectId }).lean()
}
