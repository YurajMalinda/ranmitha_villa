import { signAdminToken } from '@/lib/auth'

class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

const authService = {
  authenticateUser: async (userData: { username: string; password: string }) => {
    const { username, password } = userData

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = await signAdminToken(username)
      return { token }
    }

    throw new AppError('Invalid Username or Password', 400)
  },
}

export default authService
