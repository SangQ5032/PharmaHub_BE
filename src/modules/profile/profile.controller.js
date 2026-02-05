import * as profileService from './profile.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { AppError } from '../../utils/AppError.js'

const getUserIdFromReq = (req) => {
  return (
    (req.user && (req.user._id || req.user.id)) ||
    (req.tokenPayload && req.tokenPayload.sub) ||
    null
  )
}

export const getMe = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req)
  if (!userId) throw new AppError(401, 'Unauthorized')
  const data = await profileService.getProfileByUserId(userId)
  res.status(200).json({ success: true, data })
})

export const getSummary = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req)
  if (!userId) throw new AppError(401, 'Unauthorized')
  const data = await profileService.getProfileSummaryByUserId(userId)
  res.status(200).json({ success: true, data })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req)
  if (!userId) throw new AppError(401, 'Unauthorized')
  const data = await profileService.updateProfile(userId, req.body || {})
  res.status(200).json({ success: true, message: 'Cập nhật hồ sơ thành công', data })
})

export const changePassword = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req)
  if (!userId) throw new AppError(401, 'Unauthorized')
  const { currentPassword, newPassword } = req.body || {}
  if (!currentPassword || !newPassword) {
    throw new AppError(400, 'currentPassword và newPassword là bắt buộc')
  }
  await profileService.changePassword(userId, currentPassword, newPassword)
  res.status(204).send()
})

export const updateAvatar = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req)
  if (!userId) throw new AppError(401, 'Unauthorized')
  if (!req.file) throw new AppError(400, 'File avatar là bắt buộc')

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  const data = await profileService.updateAvatar(userId, fileUrl)
  res.status(200).json({ success: true, message: 'Cập nhật avatar thành công', data })
})

export const deactivateAccount = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req)
  if (!userId) throw new AppError(401, 'Unauthorized')
  await profileService.deactivateAccount(userId)
  res.status(204).send()
})
