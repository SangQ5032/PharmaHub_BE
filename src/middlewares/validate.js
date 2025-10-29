// Middleware validate request body với schema (Joi / express-validator)
export const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details.map((d) => d.message).join(', '),
    })
  }
  next()
}
