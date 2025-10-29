import { User } from '../users/users.model.js'

export const findByUsername = (username) => {
  return User.findOne({ username }).lean()
}

export const findById = (id) => {
  return User.findById(id).lean()
}
