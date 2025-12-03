// src/middlewares/branchAccessMiddleware.js
import { AppError } from '../utils/AppError.js'

/**
 * Middleware: Kiểm tra quyền truy cập branch dựa trên role
 *
 * Logic:
 * - system_admin/admin: Có thể truy cập bất kỳ branch từ params
 * - branch-manager: Chỉ có thể truy cập branch_id của mình
 */
export const checkBranchAccess = async (req, res, next) => {
  try {
    const branchIdFromParams = req.params.branchId
    const userRole = req.user?.role
    const userBranchId = req.user?.branch_id

    // Nếu không có branchId trong params, bỏ qua
    if (!branchIdFromParams) {
      return next()
    }

    // system_admin và admin có quyền truy cập bất kỳ branch
    if (['system_admin', 'admin'].includes(userRole)) {
      return next()
    }

    // branch-manager: kiểm tra quyền truy cập
    if (userRole === 'branch-manager') {
      // Nếu branch-manager không có branch_id, lỗi
      if (!userBranchId) {
        return next(new AppError('Branch manager phải có branch_id trong token', 401))
      }

      // Kiểm tra branchId từ params có match với branch_id của user không
      const userBranchIdStr = userBranchId.toString()
      const requestedBranchIdStr = branchIdFromParams.toString()

      if (userBranchIdStr !== requestedBranchIdStr) {
        return next(new AppError('Bạn không có quyền truy cập chi nhánh này', 403))
      }
    }

    next()
  } catch (error) {
    next(new AppError('Lỗi kiểm tra quyền truy cập: ' + error.message, 500))
  }
}

export default checkBranchAccess
