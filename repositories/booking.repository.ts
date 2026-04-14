import mongoose from 'mongoose'
import BlockedDate from '@/models/BlockedDates'
import Booking from '@/models/Booking'
import Room from '@/models/Room'

class BookingRepository {
  async getAll() {
    return await Booking.find({}).populate('room').populate('user')
  }

  async create(bookingData: any, session: any = null) {
    const booking = new Booking(bookingData)
    await booking.save({ session })
    return booking
  }

  async getOne(id: string) {
    return await Booking.findById(id)
  }

  async getByBookingId(bookingId: string) {
    return await Booking.findOne({ booking_id: bookingId })
  }

  async isAvailable(roomId: string, check_in_date: number, check_out_date: number, session: any = null) {
    const { ObjectId } = mongoose.Types
    const objectId = new ObjectId(roomId)

    const queryOpts: any = session ? { session } : {}

    const roomAvailability = await Room.findOne(
      {
        _id: objectId,
        status: { $in: ['booked', 'maintenance'] },
      },
      null,
      queryOpts
    )

    const overlappingBooking = await Booking.findOne(
      {
        room: objectId,
        status: { $in: ['pending', 'confirmed'] },
        check_in_date: { $lt: check_out_date },
        check_out_date: { $gt: check_in_date },
      },
      null,
      queryOpts
    )

    const blockedBooking = await BlockedDate.findOne(
      {
        room: objectId,
        isActive: true,
        from: { $lt: check_out_date },
        to: { $gt: check_in_date },
      },
      null,
      queryOpts
    )

    return !(overlappingBooking || roomAvailability || blockedBooking)
  }

  async confirm(bookingId: string, booking: any) {
    return await Booking.findByIdAndUpdate(bookingId, booking, { new: true })
  }

  async updateStatus(id: string, status: string) {
    return await Booking.findByIdAndUpdate(id, { status }, { new: true })
  }

  async releaseTemporary(bookingId: string) {
    return await Booking.findOneAndDelete({ booking_id: bookingId, status: 'pending', user: null })
  }

  async findOverlapping(checkIn: number, checkOut: number) {
    return await Booking.find({
      status: { $in: ['pending', 'confirmed'] },
      check_in_date: { $lt: checkOut },
      check_out_date: { $gt: checkIn },
    }).select('room')
  }
}

export default new BookingRepository()
