import Room from '@/models/Room'

class RoomRepository {
  async create(roomData: any) {
    const room = new Room(roomData)
    await room.save()
    return room
  }

  async getAll() {
    return await Room.find({})
  }

  async getOne(roomId: string) {
    return await Room.findById(roomId)
  }

  async delete(roomId: string) {
    return await Room.findByIdAndDelete(roomId)
  }

  async update(room: any) {
    return await Room.findByIdAndUpdate(room._id, room)
  }

  async updateStatus(roomId: string, status: string) {
    return await Room.findByIdAndUpdate(roomId, { status })
  }
}

export default new RoomRepository()
