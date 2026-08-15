/**
 * Sign-up gate. The admin sign-up page is publicly reachable, so without this
 * anyone who finds it could create an account with access to bookings and guest
 * contact details.
 *
 * ADMIN_ALLOWED_EMAILS is a comma-separated list. Entries are either a full
 * address (`someone@example.com`) or a whole domain (`@ranmithavilla.com`).
 */
const entries = () =>
  (process.env.ADMIN_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

export const normaliseEmail = (email: string) => String(email ?? '').trim().toLowerCase()

/** Fails closed: an unset or empty allowlist permits nobody. */
export function isAllowedEmail(email: string) {
  const list = entries()
  if (!list.length) return false

  const normalised = normaliseEmail(email)
  if (!normalised.includes('@')) return false

  const domain = normalised.slice(normalised.indexOf('@'))
  return list.some((entry) => (entry.startsWith('@') ? entry === domain : entry === normalised))
}

export const allowlistConfigured = () => entries().length > 0
