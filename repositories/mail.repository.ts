// Mail repository logic is implemented in lib/mail.ts (includes templates + nodemailer transport)
// This file re-exports the default for backward compatibility with any imports expecting
// repositories/mail.repository
import mailRepository from '@/lib/mail'
export default mailRepository
