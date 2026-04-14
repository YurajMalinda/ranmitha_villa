import mongoose from 'mongoose'
import BookingRepository from '@/repositories/booking.repository'
import mailRepository, {
  getConfirmLetter,
  getCancelLetter,
  getAdminNotificationLetter,
  getInvoiceTemplate,
} from '@/lib/mail'
import roomRepository from '@/repositories/room.repository'
import userRepository from '@/repositories/user.repository'
import userService from './user.service'
import crypto from 'crypto'
import BlockedDate from '@/models/BlockedDates'

class AppError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

class BookingService {
  generateBookingId() {
    const date = new Date()
    const prefix = `BK${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const unique = crypto.randomBytes(4).toString('hex').toUpperCase()
    return `${prefix}-${unique}`
  }

  async temporaryReserve(body: any) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const { roomId, check_in_date, check_out_date, guests } = body

      const checkIn = new Date(check_in_date).getTime()
      const checkOut = new Date(check_out_date).getTime()

      if (checkIn >= checkOut) throw new AppError('Check-out must be after check-in', 400)
      if (checkIn < Date.now()) throw new AppError('Check-in date must be in the future', 400)

      const room = await roomRepository.getOne(roomId)
      if (!room) throw new AppError('Room not found', 404)

      const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24)

      if (Number(guests) > (room as any).maxGuests) {
        throw new AppError(`Maximum ${(room as any).maxGuests} guests allowed for this room`, 400)
      }

      if (!(await BookingRepository.isAvailable(roomId, checkIn, checkOut, session))) {
        throw new AppError('Room is not available for selected dates', 409)
      }

      const booking_id = this.generateBookingId()

      const bookingData = {
        booking_id,
        room: roomId,
        user: null,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests: Number(guests),
        nights: Number(nights),
        status: 'pending',
        total_price: (room as any).pricePerNight * nights,
      }

      const booking = await BookingRepository.create(bookingData, session)

      await session.commitTransaction()
      return booking
    } catch (error: any) {
      await session.abortTransaction()
      throw new AppError(`Room reservation unsuccessful: ${error.message}`, error.statusCode || 500)
    } finally {
      session.endSession()
    }
  }

  async confirmReservation(body: any) {
    try {
      const { bookingId, roomId, userId } = body
      let reservation: any = {}

      const registeredUser: any = await userService.register(body)
      let resolvedUserId: any

      if (registeredUser && registeredUser.user) {
        resolvedUserId = registeredUser.user._id
      } else if (userId) {
        resolvedUserId = userId
      } else {
        const existingUser = await userService.findByEmail(body.email)
        if (!existingUser) throw new AppError('Could not find or create user', 400)
        resolvedUserId = (existingUser as any)._id
      }

      reservation = await BookingRepository.getByBookingId(bookingId)

      if (!reservation) {
        reservation = await this.temporaryReserve(body)
      }

      const booking = {
        booking_id: reservation['booking_id'],
        room: reservation['room'],
        user: resolvedUserId,
        check_in_date: reservation['check_in_date'],
        check_out_date: reservation['check_out_date'],
        guests: reservation['guests'],
        nights: reservation['nights'],
        status: 'confirmed',
        total_price: reservation['total_price'],
      }

      await BookingRepository.confirm(reservation._id, {
        $set: booking,
        $unset: { expiresAt: '' },
      })
      const room = await roomRepository.getOne(roomId)
      const user = await userRepository.getOne(resolvedUserId)

      const confirmLetter = (res: any, rm: any, usr: any) => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <title>Booking Confirmed - Ranmitha Villa</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding:20px 0;">
                        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
                            <tr>
                                <td style="background:#2f855a; padding:20px; text-align:center; color:#ffffff;">
                                    <h1 style="margin:0; font-size:24px;">✔ Booking Confirmed</h1>
                                    <p style="margin:5px 0 0;">Ranmitha Villa</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:25px; color:#333333;">
                                    <p style="font-size:16px;">Hello <strong>${usr['firstname']}</strong>,</p>
                                    <p>Your booking has been successfully confirmed. We're excited to welcome you 🌴</p>
                                    <h3 style="border-bottom:1px solid #ddd; padding-bottom:5px;">📌 Booking Details</h3>
                                    <table width="100%" cellpadding="5">
                                        <tr><td><strong>Booking ID:</strong></td><td>${res['booking_id']}</td></tr>
                                        <tr><td><strong>Status:</strong></td><td style="color:#2f855a;"><strong>Confirmed</strong></td></tr>
                                    </table>
                                    <h3 style="border-bottom:1px solid #ddd; padding-bottom:5px;">🏡 Stay Details</h3>
                                    <table width="100%" cellpadding="5">
                                        <tr><td><strong>Room:</strong></td><td>${rm['type']}</td></tr>
                                        <tr><td><strong>Guests:</strong></td><td>${res['guests']}</td></tr>
                                    </table>
                                    <h3 style="border-bottom:1px solid #ddd; padding-bottom:5px;">📅 Date Details</h3>
                                    <table width="100%" cellpadding="5">
                                        <tr><td><strong>Check-in:</strong></td><td>${new Date(res['check_in_date']).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                                        <tr><td><strong>Check-out:</strong></td><td>${new Date(res['check_out_date']).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                                        <tr><td><strong>Nights:</strong></td><td>${res['nights']}</td></tr>
                                    </table>
                                    <h3 style="border-bottom:1px solid #ddd; padding-bottom:5px;">💰 Payment Summary</h3>
                                    <table width="100%" cellpadding="5">
                                        <tr><td><strong>Price per Night:</strong></td><td>${rm['pricePerNight']} LKR</td></tr>
                                        <tr><td><strong>Total Amount:</strong></td><td><strong>${res['total_price']} LKR</strong></td></tr>
                                        <tr><td><strong>Payment Method:</strong></td><td>Pay at Villa</td></tr>
                                    </table>
                                    <h3 style="border-bottom:1px solid #ddd; padding-bottom:5px;">⏰ Check-in Information</h3>
                                    <p>Check-in: After 2:00 PM<br />Check-out: Before 11:00 AM</p>
                                    <p style="margin-top:25px;">If you have any questions, just reply to this email.</p>
                                    <p style="margin-top:20px;">Warm regards,<br /><strong>Ranmitha Villa Team</strong></p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background:#f4f4f4; padding:15px; text-align:center; font-size:12px; color:#777;">© Ranmitha Villa · Sri Lanka</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `

      try {
        await mailRepository.booking(booking, room, user, confirmLetter, getAdminNotificationLetter, getInvoiceTemplate)
        console.log(`Email sent successfully for booking ${booking.booking_id}`)
      } catch (emailError: any) {
        console.error(`Email sending failed for booking ${booking.booking_id}:`, emailError.message)
        console.error(emailError)
      }

      const confirmedBooking = {
        token: registeredUser?.token || 'already have token',
        booking_id: booking.booking_id,
      }
      return confirmedBooking
    } catch (error: any) {
      throw new AppError(`Can't change reservation status or reserve room: ${error.message}`, error.statusCode || 500)
    }
  }

  async cancelReservation(body: any) {
    try {
      const { bookingId, userId } = body

      const reservation: any = await BookingRepository.getByBookingId(bookingId)
      if (!reservation) throw new AppError('Booking not found', 404)

      if (reservation.user.toString() !== userId) {
        throw new AppError('Unauthorized to cancel this booking', 403)
      }

      const room = await roomRepository.getOne(reservation['room'])
      const user = await userRepository.getOne(reservation['user'])
      const checkIn = new Date(reservation['check_in_date']).getTime()
      const datesToCheckIn = (checkIn - Date.now()) / (1000 * 60 * 60 * 24)

      if (datesToCheckIn < 5) throw new AppError('Cannot cancel less than 5 days before check-in', 400)

      const cancelLetterHtml = getCancelLetter(reservation, room, user)

      const cancelled = await BookingRepository.updateStatus(reservation._id, 'cancelled')

      try {
        await mailRepository.cancel(reservation, room, user, cancelLetterHtml)
      } catch (emailError: any) {
        console.error(`Cancel email failed for booking ${reservation.booking_id}:`, emailError.message)
      }

      return cancelled
    } catch (error: any) {
      throw new AppError(`Can't cancelled reservation: ${error.message}`, error.statusCode || 400)
    }
  }

  async allReservation() {
    try {
      return await BookingRepository.getAll()
    } catch (error: any) {
      throw new AppError(`Can't fetch reservations: ${error.message}`, 500)
    }
  }

  async singleReservation(body: any) {
    try {
      const { bookingId, userId } = body
      const reservation: any = await BookingRepository.getOne(bookingId)

      if (!reservation) throw new AppError('Booking not found', 404)

      if (reservation.user._id.toString() !== userId && reservation.user.toString() !== userId) {
        throw new AppError('Unauthorized to view this booking', 403)
      }

      return reservation
    } catch (error: any) {
      throw new AppError(`Can't fetch booking information: ${error.message}`, error.statusCode || 500)
    }
  }

  async adminUpdateStatus(bookingId: string, status: string) {
    try {
      const reservation: any = await BookingRepository.getOne(bookingId)
      if (!reservation) throw new AppError('Booking not found', 404)

      const updatedBooking: any = await BookingRepository.updateStatus(bookingId, status)

      try {
        const room = await roomRepository.getOne(reservation.room._id || reservation.room)
        const user = await userRepository.getOne(reservation.user._id || reservation.user)

        if (status === 'confirmed') {
          await mailRepository.booking(updatedBooking, room, user, getConfirmLetter, getAdminNotificationLetter, getInvoiceTemplate)
        } else if (status === 'cancelled') {
          await mailRepository.cancel(updatedBooking, room, user, getCancelLetter, getAdminNotificationLetter, getInvoiceTemplate)
        }
      } catch (emailError: any) {
        console.error(`Admin status update email failed: ${emailError.message}`)
      }

      return updatedBooking
    } catch (error: any) {
      throw new AppError(`Can't update booking status: ${error.message}`, error.statusCode || 500)
    }
  }

  async releaseTemporary(bookingId: string) {
    try {
      if (!bookingId) throw new AppError('Booking ID required', 400)
      const deleted = await BookingRepository.releaseTemporary(bookingId)
      if (!deleted) throw new AppError('Temporary reservation not found or already confirmed', 404)
      return deleted
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500)
    }
  }

  async getAvailableRooms(body: any) {
    try {
      const { check_in_date, check_out_date, guests } = body
      const checkIn = new Date(check_in_date).getTime()
      const checkOut = new Date(check_out_date).getTime()

      if (isNaN(checkIn) || isNaN(checkOut)) throw new AppError('Invalid dates provided', 400)
      if (checkIn >= checkOut) throw new AppError('Check-out must be after check-in', 400)

      const allRooms = await roomRepository.getAll()

      const bookedRooms = await BookingRepository.findOverlapping(checkIn, checkOut)
      const bookedRoomIds = bookedRooms.map((b: any) => b.room.toString())

      const blockedDates = await BlockedDate.find({
        isActive: true,
        from: { $lt: check_out_date },
        to: { $gt: check_in_date },
      })
      const blockedRoomIds = blockedDates.map((b: any) => b.room.toString())

      const availableRooms = allRooms.filter((room: any) => {
        const isBooked = bookedRoomIds.includes(room._id.toString())
        const isBlocked = blockedRoomIds.includes(room._id.toString())
        const hasCapacity = room.maxGuests >= Number(guests)

        return !isBooked && !isBlocked && hasCapacity
      })

      return availableRooms
    } catch (error: any) {
      throw new AppError(`Failed to search available rooms: ${error.message}`, error.statusCode || 500)
    }
  }
}

export default new BookingService()
