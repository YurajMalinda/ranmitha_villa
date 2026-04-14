import User from '@/models/User'

class UserRepository {
  async checkExists(email: string) {
    return await User.findOne({ email })
  }

  async register(userData: any) {
    return await new User(userData).save()
  }

  async update(user: any) {
    return await User.findByIdAndUpdate(user._id, user)
  }

  async delete(userId: string) {
    return await User.findByIdAndDelete(userId)
  }

  async getAll() {
    return await User.find({})
  }

  async getOne(userId: string) {
    return await User.findById(userId)
  }
}

export default new UserRepository()
