import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

/** Links in emails must be absolute, and must point at the deployed site. */
export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

const shell = (heading: string, body: string, cta: { label: string; href: string }, footer: string) => `
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f7fafc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#4a5568;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px;">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr><td style="background:#2E5D4B;padding:22px;text-align:center;color:#ffffff;">
        <h1 style="margin:0;font-size:19px;font-weight:600;">${heading}</h1>
        <p style="margin:4px 0 0;opacity:.85;font-size:13px;">Ranmitha Villa Admin</p>
      </td></tr>
      <tr><td style="padding:30px 28px;">
        ${body}
        <p style="text-align:center;margin:28px 0 8px;">
          <a href="${cta.href}" style="display:inline-block;background:#2E5D4B;color:#ffffff;padding:12px 26px;border-radius:6px;text-decoration:none;font-weight:bold;">${cta.label}</a>
        </p>
        <p style="font-size:12px;color:#a0aec0;margin-top:22px;line-height:1.6;">
          If the button does not work, paste this into your browser:<br />
          <span style="color:#718096;word-break:break-all;">${cta.href}</span>
        </p>
      </td></tr>
      <tr><td style="background:#edf2f7;padding:16px;text-align:center;font-size:12px;color:#718096;">${footer}</td></tr>
    </table>
  </td></tr></table>
</body></html>`

export async function sendVerificationEmail(to: string, name: string, rawToken: string) {
  const href = `${siteUrl()}/admin/verify-email?token=${encodeURIComponent(rawToken)}`
  await transporter.sendMail({
    from: `"Ranmitha Villa Admin" <${process.env.GMAIL}>`,
    to,
    subject: 'Confirm your Ranmitha Villa admin account',
    html: shell(
      'Confirm your email',
      `<p style="margin:0 0 12px;">Hi ${name},</p>
       <p style="margin:0;line-height:1.6;">An admin account was created for this address. Confirm it to activate your access.</p>`,
      { label: 'Confirm email', href },
      'This link expires in 24 hours. If you did not request it, ignore this email.'
    ),
  })
}

export async function sendPasswordResetEmail(to: string, name: string, rawToken: string) {
  const href = `${siteUrl()}/admin/reset-password?token=${encodeURIComponent(rawToken)}`
  await transporter.sendMail({
    from: `"Ranmitha Villa Admin" <${process.env.GMAIL}>`,
    to,
    subject: 'Reset your Ranmitha Villa admin password',
    html: shell(
      'Reset your password',
      `<p style="margin:0 0 12px;">Hi ${name},</p>
       <p style="margin:0;line-height:1.6;">We received a request to reset the password for this admin account. Choose a new one below.</p>`,
      { label: 'Reset password', href },
      'This link expires in 1 hour and can be used once. If you did not request it, ignore this email — your password has not changed.'
    ),
  })
}
