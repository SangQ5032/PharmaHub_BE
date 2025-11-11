import { Schema } from 'mongoose'

// Define login attempt schema to track failed logins
const LoginAttemptSchema = new Schema({
  username: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  successful: { type: Boolean, default: false },
  ip: String,
})

export default LoginAttemptSchema
