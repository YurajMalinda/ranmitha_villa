import nodemailer from 'nodemailer'
import { generateInvoicePDF } from './pdf'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export const getInvoiceTemplate = (reservation: any, room: any, user: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice - Ranmitha Villa</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #2f855a; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { margin: 0; color: #888; }
        .invoice-details p { margin: 5px 0 0; font-size: 14px; }
        .bill-to { margin-bottom: 30px; }
        .bill-to h3 { margin: 0 0 10px; font-size: 16px; color: #555; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .table th { text-align: left; padding: 12px; background: #f9f9f9; border-bottom: 1px solid #eee; font-size: 14px; color: #666; }
        .table td { padding: 12px; border-bottom: 1px solid #eee; }
        .total-row td { font-weight: bold; font-size: 18px; border-top: 2px solid #333; border-bottom: none; }
        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        .badge { display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .badge-confirmed { background: #e6ffFA; color: #2f855a; }
        .badge-cancelled { background: #fff5f5; color: #c53030; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Ranmitha Villa</div>
        <div class="invoice-details">
            <h2>INVOICE</h2>
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Invoice #: INV-${reservation.booking_id.split('-').pop()}</p>
            <p>Booking ID: ${reservation.booking_id}</p>
        </div>
    </div>

    <div class="bill-to">
        <h3>Bill To:</h3>
        <p>
            ${user.firstname} ${user.lastname || ''}<br>
            ${user.email}<br>
            ${user.mobile || ''}
        </p>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>${room.type}</strong><br>
                    <span style="font-size:12px; color:#777;">
                        Check-in: ${new Date(reservation.check_in_date).toLocaleDateString()}<br>
                        Check-out: ${new Date(reservation.check_out_date).toLocaleDateString()}
                    </span>
                </td>
                <td>${reservation.nights} Nights</td>
                <td>${room.pricePerNight.toLocaleString()} LKR</td>
                <td>${(reservation.nights * room.pricePerNight).toLocaleString()} LKR</td>
            </tr>
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3" style="text-align:right;">Total:</td>
                <td>${reservation.total_price.toLocaleString()} LKR</td>
            </tr>
        </tfoot>
    </table>

    <div style="margin-top: 20px;">
        <p><strong>Payment Status:</strong> To be paid at property</p>
        <p><strong>Booking Status:</strong>
            <span class="badge ${reservation.status === 'cancelled' ? 'badge-cancelled' : 'badge-confirmed'}">
                ${reservation.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}
            </span>
        </p>
    </div>

    <div class="footer">
        <p>Thank you for choosing Ranmitha Villa!</p>
        <p>Ranmitha Villa, Sri Lanka | +94 XX XXX XXXX | ranmithavilla@gmail.com</p>
    </div>
</body>
</html>
`

export const getConfirmLetter = (reservation: any, room: any, user: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Booking Confirmed - Ranmitha Villa</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        body { margin: 0; padding: 0; background-color: #f7fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #4a5568; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px; }
        .header { background: #2f855a; padding: 30px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #2d3748; }
        .card { background: #f8fff9; border: 1px solid #c6f6d5; border-radius: 6px; padding: 20px; margin-bottom: 25px; }
        .card-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #c6f6d5; padding-bottom: 10px; }
        .card-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .card-label { font-weight: 600; color: #276749; min-width: 100px; }
        .card-value { text-align: right; color: #2f855a; }
        .footer { background: #edf2f7; padding: 20px; text-align: center; font-size: 12px; color: #718096; }
        .btn { display: inline-block; background: #2f855a; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Confirmed! 🌴</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">We can't wait to host you at Ranmitha Villa</p>
        </div>

        <div class="content">
            <p class="greeting">Hi ${user.firstname},</p>
            <p>Your stay is officially booked! We've attached a PDF invoice for your records.</p>

            <div class="card">
                <div class="card-row">
                    <span class="card-label">Booking ID</span>
                    <span class="card-value">#${reservation.booking_id}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Room</span>
                    <span class="card-value">${room.type}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Check-in</span>
                    <span class="card-value">${new Date(reservation.check_in_date).toDateString()} (After 2PM)</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Check-out</span>
                    <span class="card-value">${new Date(reservation.check_out_date).toDateString()} (Before 11AM)</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Total to Pay</span>
                    <span class="card-value" style="font-size: 18px; font-weight: bold;">LKR ${reservation.total_price.toLocaleString()}</span>
                </div>
            </div>

            <p style="margin-top: 30px; font-size: 14px; line-height: 1.6;">
                <strong>Need directions?</strong><br>
                Ranmitha Villa is located at 550 Matara Rd, Weligama 81700 <br>
                <a href="https://maps.app.goo.gl/ASzEMq7Gdnp6y7yw6" style="color: #2f855a; text-decoration: none;">View on Google Maps &rarr;</a>
            </p>
        </div>

        <div class="footer">
            <p>© ${new Date().getFullYear()} Ranmitha Villa. All rights reserved.</p>
            <p>Questions? Reply to this email or call us at +94 XX XXX XXXX</p>
        </div>
    </div>
</body>
</html>
`

export const getCancelLetter = (reservation: any, room: any, user: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Booking Cancelled - Ranmitha Villa</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        body { margin: 0; padding: 0; background-color: #f7fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #4a5568; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px; }
        .header { background: #e53e3e; padding: 30px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #2d3748; }
        .card { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 20px; margin-bottom: 25px; }
        .card-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #fed7d7; padding-bottom: 10px; color: #c53030; }
        .card-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .card-label { font-weight: 600; min-width: 100px; }
        .card-value { text-align: right; }
        .footer { background: #edf2f7; padding: 20px; text-align: center; font-size: 12px; color: #718096; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Cancelled</h1>
        </div>

        <div class="content">
            <p class="greeting">Hi ${user.firstname},</p>
            <p>We're sorry to see you go. Your booking at Ranmitha Villa has been cancelled as requested.</p>

            <div class="card">
                <div class="card-row">
                    <span class="card-label">Booking ID</span>
                    <span class="card-value">#${reservation.booking_id}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Room</span>
                    <span class="card-value">${room.type}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Dates</span>
                    <span class="card-value">${new Date(reservation.check_in_date).toLocaleDateString()} - ${new Date(reservation.check_out_date).toLocaleDateString()}</span>
                </div>
            </div>

            <p>If you have any questions about refunds or rebooking, please simply reply to this email.</p>
            <p>We hope to have the opportunity to host you in the future!</p>
        </div>

        <div class="footer">
            <p>© ${new Date().getFullYear()} Ranmitha Villa. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

export const getAdminNotificationLetter = (reservation: any, room: any, user: any, type = 'NEW') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Admin Notification - Ranmitha Villa</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="padding:20px 0;">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #ddd;">
                    <tr>
                        <td style="background:${type === 'NEW' ? '#2b6cb0' : '#c53030'}; padding:15px; text-align:center; color:#ffffff;">
                            <h2 style="margin:0; font-size:20px;">${type === 'NEW' ? '🔔 New Booking Received' : '⚠️ Booking Cancelled'}</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px; color:#333333;">
                            <p><strong>Admin Alert:</strong> A booking has been ${type === 'NEW' ? 'placed' : 'cancelled'}.</p>

                            <h3 style="border-bottom:1px solid #eee; padding-bottom:5px; margin-top:20px;">👤 Guest Details</h3>
                            <p style="margin:5px 0;">
                                Name: <strong>${user.firstname} ${user.lastname || ''}</strong><br>
                                Email: ${user.email}<br>
                                Phone: ${user.mobile || user.phone || 'N/A'}
                            </p>

                            <h3 style="border-bottom:1px solid #eee; padding-bottom:5px; margin-top:20px;">🏨 Booking Details</h3>
                            <p style="margin:5px 0;">
                                <strong>Booking ID:</strong> ${reservation.booking_id}<br>
                                <strong>Room:</strong> ${room.type}<br>
                                <strong>Stay:</strong> ${new Date(reservation.check_in_date).toDateString()} - ${new Date(reservation.check_out_date).toDateString()}<br>
                                <strong>Nights:</strong> ${reservation.nights}<br>
                                <strong>Total:</strong> LKR ${reservation.total_price}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`

class MailRepository {
  async booking(reservation: any, room: any, user: any, confirmLetter: Function, adminLetter: Function | null, invoiceTemplate: Function) {
    const pdfPath = await generateInvoicePDF(
      invoiceTemplate(reservation, room, user),
      `invoice-${reservation['booking_id']}.pdf`
    )

    const guestInfo = await transporter.sendMail({
      from: `"Ranmitha Villa" <${process.env.GMAIL}>`,
      to: user['email'],
      subject: 'Booking Confirmed - Your Stay at Ranmitha Villa',
      html: typeof confirmLetter === 'function' ? confirmLetter(reservation, room, user) : confirmLetter,
      attachments: [
        {
          filename: 'Booking-Invoice.pdf',
          path: pdfPath,
        },
      ],
    })

    if (adminLetter) {
      await transporter.sendMail({
        from: `"Ranmitha Villa System" <${process.env.GMAIL}>`,
        to: process.env.GMAIL,
        subject: `[New Booking] ${reservation['booking_id']} - ${user['firstname']}`,
        html: typeof adminLetter === 'function' ? adminLetter(reservation, room, user, 'NEW') : adminLetter,
      })
    }

    return guestInfo
  }

  async cancel(reservation: any, room: any, user: any, cancelLetter: Function | string, adminLetter?: Function | null, invoiceTemplate?: Function) {
    let pdfPath: string | null = null
    if (invoiceTemplate) {
      pdfPath = await generateInvoicePDF(
        invoiceTemplate(reservation, room, user),
        `cancelled-${reservation['booking_id']}.pdf`
      )
    }

    const guestInfo = await transporter.sendMail({
      from: `"Ranmitha Villa" <${process.env.GMAIL}>`,
      to: user['email'],
      subject: 'Booking Cancelled - Ranmitha Villa',
      html: typeof cancelLetter === 'function' ? cancelLetter(reservation, room, user) : cancelLetter,
      ...(pdfPath ? {
        attachments: [
          {
            filename: 'Booking-Cancelled.pdf',
            path: pdfPath,
          },
        ],
      } : {}),
    })

    if (adminLetter) {
      await transporter.sendMail({
        from: `"Ranmitha Villa System" <${process.env.GMAIL}>`,
        to: process.env.GMAIL,
        subject: `[Cancelled] ${reservation['booking_id']} - ${user['firstname']}`,
        html: typeof adminLetter === 'function' ? adminLetter(reservation, room, user, 'CANCEL') : adminLetter,
      })
    }

    return guestInfo
  }
}

export default new MailRepository()
