// Wrapper async function cho controller, tránh try/catch lặp lại
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
