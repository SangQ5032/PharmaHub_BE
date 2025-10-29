import { User } from './users.model.js'

export const findAll = () => {
  return User.find().lean()
}
