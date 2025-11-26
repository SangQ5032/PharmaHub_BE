import { User } from './users.model.js'
import mongoose from 'mongoose'

export const findAll = () => {
  return User.find().lean()
}

export const findByBranchId = (branchId) => {
  const objectId = new mongoose.Types.ObjectId(branchId)
  return User.find({ branch_id: objectId }).lean()
}

export const findById = (userId) => {
  const objectId = new mongoose.Types.ObjectId(userId)
  return User.findById(objectId).lean()
}

export const updateBranch = (userId, branchId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId)
  const branchObjectId = branchId ? new mongoose.Types.ObjectId(branchId) : null
  return User.findByIdAndUpdate(userObjectId, { branch_id: branchObjectId }, { new: true }).lean()
}

export const findByUsername = (username) => {
  return User.findOne({ username }).lean()
}

export const createUser = (userData) => {
  const newUser = new User(userData)
  return newUser.save()
}
