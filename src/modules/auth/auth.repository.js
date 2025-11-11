import { User } from '../users/users.model.js'
import mongoose from 'mongoose'
import LoginAttemptSchema from '../auth/auth.model.js'

const LoginAttempt = mongoose.model('LoginAttempt', LoginAttemptSchema)

export const findByUsername = (username) => {
  return User.findOne({ username }).lean()
}

export const findById = (id) => {
  return User.findById(id).lean()
}

export const findByPhone = (phone) => {
  return User.findOne({ phone }).lean()
}

export const recordLoginAttempt = (username, successful, ip) => {
  return LoginAttempt.create({
    username,
    successful,
    ip,
    timestamp: new Date(),
  })
}

export const getRecentLoginAttempts = (username, minutes = 15) => {
  const timeAgo = new Date(Date.now() - minutes * 60 * 1000)
  return LoginAttempt.find({
    username,
    timestamp: { $gte: timeAgo },
  }).sort({ timestamp: -1 })
}
