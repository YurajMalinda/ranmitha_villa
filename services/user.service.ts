import userRepository from '@/repositories/user.repository'
import validator from 'validator'
import { signUserToken } from '@/lib/auth'

class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

class UserService {
  async register(body: any) {
    try {
      const { firstname, lastname, email, country, mobile, urlHash } = body

      if (!validator.isEmail(email)) throw new AppError('Enter valid email address', 400)

      const existingUser = await userRepository.checkExists(email)
      if (existingUser) {
        if (urlHash === 'booking') {
          return {
            user: existingUser,
            token: await signUserToken(String(existingUser._id)),
          }
        }
        throw new AppError('User already exists', 400)
      }

      const newUser = {
        firstname,
        lastname,
        email,
        country,
        mobile: Number(mobile),
      }

      const user = await userRepository.register(newUser)

      return {
        user,
        token: await signUserToken(String(user._id)),
      }
    } catch (error: any) {
      throw new AppError(`Can't register user: ${error.message}`, error.statusCode || 500)
    }
  }

  async update(body: any) {
    try {
      const { userId, firstname, lastname, mobile } = body

      const user: any = await userRepository.getOne(userId)

      user['firstname'] = firstname
      user['lastname'] = lastname
      user['mobile'] = mobile

      return await userRepository.update(user)
    } catch (error: any) {
      throw new AppError(`Can't update user: ${error.message}`, 500)
    }
  }

  async remove(body: any) {
    try {
      const { userId } = body

      if (!userId) throw new AppError('User ID not found', 400)

      return await userRepository.delete(userId)
    } catch (error: any) {
      throw new AppError(`Can't remove user: ${error.message}`, 500)
    }
  }

  async getUsers() {
    try {
      return await userRepository.getAll()
    } catch (error: any) {
      throw new AppError(`Can't fetch users: ${error.message}`, 500)
    }
  }

  async getUser(body: any) {
    try {
      const { userId } = body

      if (!userId) throw new AppError('User ID not found', 400)

      return await userRepository.getOne(userId)
    } catch (error: any) {
      throw new AppError(`Can't fetch user: ${error.message}`, 500)
    }
  }

  async findByEmail(email: string) {
    return await userRepository.checkExists(email)
  }
}

export default new UserService()
