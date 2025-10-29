// Các config mặc định của dự án
export default {
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
}
