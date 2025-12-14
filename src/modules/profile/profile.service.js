import bcrypt from 'bcryptjs'
import { User } from '../users/users.model.js'
import Branch from '../branch/branch.model.js'
import { AppError } from '../../utils/AppError.js'

const mapUserToProfile = (user, branchDoc = null) => {
  if (!user) return null
  const branchId = user.branch_id || null
  const branchName = branchDoc ? branchDoc.name : undefined
  return {
    id: user._id,
    username: user.username,
    fullName: user.name || '',
    email: user.contact?.email || null,
    phone: user.contact?.phone || null,
    role: user.role,
    avatarUrl: user.avatarUrl || null,
    branchId,
    branchName: branchName || undefined,
    position: undefined, // Not modeled yet
    address: user.address || '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export const getProfileByUserId = async (userId) => {
  const user = await User.findById(userId).lean()
  if (!user) throw new AppError(404, 'User not found')

  let branchDoc = null
  if (user.branch_id) {
    try {
      branchDoc = await Branch.findById(user.branch_id).lean()
    } catch (_) {
      branchDoc = null
    }
  }

  return mapUserToProfile(user, branchDoc)
}

export const getProfileSummaryByUserId = async (userId) => {
  const user = await User.findById(userId).lean()
  if (!user) throw new AppError(404, 'User not found')
  return {
    fullName: user.name || '',
    role: user.role,
    avatarUrl: user.avatarUrl || null,
  }
}

export const updateProfile = async (userId, payload) => {
  const update = {}
  if (payload.fullName !== undefined) update.name = payload.fullName
  if (payload.address !== undefined) update.address = payload.address
  if (payload.avatarUrl !== undefined) update.avatarUrl = payload.avatarUrl
  if (payload.email !== undefined) update['contact.email'] = payload.email
  if (payload.phone !== undefined) update['contact.phone'] = payload.phone

  if (Object.keys(update).length === 0) {
    throw new AppError(400, 'No valid fields to update')
  }

  const updated = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).lean()
  if (!updated) throw new AppError(404, 'User not found')

  let branchDoc = null
  if (updated.branch_id) {
    try {
      branchDoc = await Branch.findById(updated.branch_id).lean()
    } catch (_) {
      branchDoc = null
    }
  }

  return mapUserToProfile(updated, branchDoc)
}

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId)
  if (!user) throw new AppError(404, 'User not found')

  if (!user.password_hash) {
    throw new AppError(400, 'Mật khẩu nội bộ không khả dụng (đăng nhập bằng Firebase)')
  }

  const matched = await bcrypt.compare(currentPassword, user.password_hash)
  if (!matched) throw new AppError(400, 'Mật khẩu hiện tại không đúng')

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(newPassword, salt)
  user.password_hash = hash
  await user.save()

  return true
}

export const updateAvatar = async (userId, avatarPublicUrl) => {
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { avatarUrl: avatarPublicUrl } },
    { new: true }
  ).lean()
  if (!updated) throw new AppError(404, 'User not found')
  return {
    avatarUrl: updated.avatarUrl || avatarPublicUrl,
  }
}

export const deactivateAccount = async (userId) => {
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { status: 'inactive' } },
    { new: true }
  ).lean()
  if (!updated) throw new AppError(404, 'User not found')
  return true
}
