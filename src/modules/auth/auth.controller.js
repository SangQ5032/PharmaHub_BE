import * as authService from './auth.service.js'
import { catchAsync } from '../../utils/catchAsync.js'

/**
 * API kiểm tra Firebase ID Token và xác minh với MongoDB
 * POST /api/auth/check-token
 * Body: { idToken: string }
 *
 * Kiểm tra:
 * 1. Firebase ID Token hợp lệ
 * 2. Số điện thoại trong token
 * 3. User tồn tại trong MongoDB
 * 4. Số điện thoại khớp với DB
 * 5. Trạng thái user hoạt động
 */
export const checkToken = catchAsync(async (req, res) => {
  const { idToken } = req.body

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: 'ID Token là bắt buộc',
    })
  }

  const result = await authService.checkFirebaseToken(idToken)

  res.json({
    success: true,
    message: 'Kiểm tra token thành công',
    data: result,
  })
})
