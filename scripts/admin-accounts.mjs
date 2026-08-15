/**
 * Manage admin panel accounts.
 *
 *   node --env-file=.env.local scripts/admin-accounts.mjs list
 *   node --env-file=.env.local scripts/admin-accounts.mjs create <username> "<Full Name>" <password> [email]
 *   node --env-file=.env.local scripts/admin-accounts.mjs passwd <username> <new-password>
 *   node --env-file=.env.local scripts/admin-accounts.mjs disable <username>
 *   node --env-file=.env.local scripts/admin-accounts.mjs enable  <username>
 *
 * Accounts are deactivated rather than deleted so ActivityLog entries keep
 * resolving to a name.
 */
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const MIN_PASSWORD = 12

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    lastLoginAt: { type: Date, required: false },
  },
  { timestamps: true }
)
const Admin = mongoose.models.admin || mongoose.model('admin', adminSchema)

const [, , command, ...args] = process.argv

const die = (msg) => {
  console.error(msg)
  process.exit(1)
}

if (!process.env.MONGODB_URI) die('MONGODB_URI is not set. Run with --env-file=.env.local')

await mongoose.connect(process.env.MONGODB_URI)

const requirePassword = (pw) => {
  if (!pw || pw.length < MIN_PASSWORD) {
    die(`Password must be at least ${MIN_PASSWORD} characters (got ${pw ? pw.length : 0}).`)
  }
}

switch (command) {
  case 'list': {
    const admins = await Admin.find().sort({ createdAt: 1 })
    if (!admins.length) {
      console.log('No admin accounts yet. Create one with:\n  node --env-file=.env.local scripts/admin-accounts.mjs create <username> "<Full Name>" <password>')
      break
    }
    console.log(`${'USERNAME'.padEnd(16)}${'NAME'.padEnd(22)}${'ACTIVE'.padEnd(8)}LAST LOGIN`)
    for (const a of admins) {
      console.log(
        a.username.padEnd(16) +
          a.name.padEnd(22) +
          (a.isActive ? 'yes' : 'no').padEnd(8) +
          (a.lastLoginAt ? a.lastLoginAt.toISOString().slice(0, 16).replace('T', ' ') : 'never')
      )
    }
    break
  }

  case 'create': {
    const [username, name, password, email] = args
    if (!username || !name || !password) {
      die('Usage: create <username> "<Full Name>" <password> [email]')
    }
    requirePassword(password)
    if (await Admin.findOne({ username: username.toLowerCase() })) {
      die(`Admin "${username}" already exists. Use passwd to change their password.`)
    }
    await Admin.create({
      username: username.toLowerCase(),
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
    })
    console.log(`Created admin "${username}" (${name}).`)
    break
  }

  case 'passwd': {
    const [username, password] = args
    if (!username || !password) die('Usage: passwd <username> <new-password>')
    requirePassword(password)
    const admin = await Admin.findOne({ username: username.toLowerCase() })
    if (!admin) die(`No admin named "${username}".`)
    admin.passwordHash = await bcrypt.hash(password, 12)
    await admin.save()
    console.log(`Password updated for "${username}".`)
    break
  }

  case 'disable':
  case 'enable': {
    const [username] = args
    if (!username) die(`Usage: ${command} <username>`)
    const admin = await Admin.findOne({ username: username.toLowerCase() })
    if (!admin) die(`No admin named "${username}".`)
    admin.isActive = command === 'enable'
    await admin.save()
    console.log(`Admin "${username}" ${admin.isActive ? 'enabled' : 'disabled'}.`)
    break
  }

  default:
    console.log(`Usage:
  list
  create <username> "<Full Name>" <password> [email]
  passwd <username> <new-password>
  disable <username>
  enable  <username>

Run with: node --env-file=.env.local scripts/admin-accounts.mjs <command>`)
}

await mongoose.disconnect()
