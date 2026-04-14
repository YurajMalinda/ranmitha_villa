import RoomRepository from '@/repositories/room.repository'

class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

class RoomService {
  async createRoom(body: any, imageUrls: Record<string, string>) {
    try {
      const { type, description, pricePerNight, maxGuests, bedrooms, beds, size, amenities, bathrooms, hasAC, status } = body

      const images = Object.values(imageUrls).filter(Boolean)

      const roomData = {
        type,
        description,
        pricePerNight: Number(pricePerNight),
        maxGuests: Number(maxGuests),
        beds: JSON.parse(beds),
        bedrooms: Number(bedrooms),
        size,
        images,
        amenities: JSON.parse(amenities),
        bathrooms: Number(bathrooms),
        hasAC: hasAC === 'true',
        status,
      }
      const room = await RoomRepository.create(roomData)

      if (!room) {
        throw new AppError('Room creation failed', 500)
      }

      return room
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        throw new AppError(error.message, 400)
      }
      throw new AppError('Failed to create room', 500)
    }
  }

  async getRooms() {
    try {
      return await RoomRepository.getAll()
    } catch (error: any) {
      throw new AppError(`Failed to fetch all room details: ${error.message}`, 500)
    }
  }

  async getRoom(roomId: string) {
    try {
      if (!roomId) {
        throw new AppError('Room ID must be needed', 400)
      }
      return await RoomRepository.getOne(roomId)
    } catch (error: any) {
      throw new AppError(`Failed to fetch room details: ${error.message}`, 500)
    }
  }

  async removeRoom(roomId: string) {
    try {
      if (!roomId) {
        throw new AppError('Room ID must be needed', 400)
      }
      return await RoomRepository.delete(roomId)
    } catch (error: any) {
      throw new AppError(`Failed to delete room: ${error.message}`, 500)
    }
  }

  async updateRoom(body: any, newImageUrls: Record<string, string>) {
    try {
      const { roomId, type, description, pricePerNight, maxGuests, beds, bedrooms, size, amenities, bathrooms, hasAC } = body

      if (!roomId) {
        throw new AppError('Room ID must be needed', 400)
      }

      const room: any = await RoomRepository.getOne(roomId)
      if (!room) throw new AppError('Room not found', 404)

      let finalImages: string[] = []

      if (body.existingImages) {
        try {
          const parsed = JSON.parse(body.existingImages)
          if (Array.isArray(parsed)) finalImages = parsed
        } catch (e) {
          if (typeof body.existingImages === 'string' && body.existingImages.startsWith('http')) {
            finalImages = [body.existingImages]
          }
        }
      }

      const newUrls = Object.values(newImageUrls).filter(Boolean)
      if (newUrls.length > 0) {
        finalImages = [...finalImages, ...newUrls]
      }

      if (body.existingImages !== undefined || newUrls.length > 0) {
        room['images'] = finalImages
      }

      room['type'] = type
      room['description'] = description
      room['pricePerNight'] = Number(pricePerNight)
      room['maxGuests'] = Number(maxGuests)
      room['beds'] = JSON.parse(beds)
      room['bedrooms'] = Number(bedrooms)
      room['size'] = size
      room['amenities'] = JSON.parse(amenities)
      room['bathrooms'] = Number(bathrooms)
      room['hasAC'] = hasAC === 'true'

      return await RoomRepository.update(room)
    } catch (error: any) {
      throw new AppError(`Failed to update room data: ${error.message}`, 500)
    }
  }

  async updateStatus(roomId: string, status: string) {
    try {
      if (!roomId) {
        throw new AppError('Room ID must be needed', 400)
      }
      return await RoomRepository.updateStatus(roomId, status)
    } catch (error: any) {
      throw new AppError(`Failed to update room status: ${error.message}`, 500)
    }
  }
}

export default new RoomService()
