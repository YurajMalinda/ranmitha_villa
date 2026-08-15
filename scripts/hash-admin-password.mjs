/**
 * Generates the bcrypt hash for ADMIN_PASSWORD_HASH.
 *
 *   node scripts/hash-admin-password.mjs 'your-new-password'
 *
 * Copy the printed line into .env.local and into your host's environment
 * variables, then remove ADMIN_PASSWORD.
 */
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const bcrypt = require('bcrypt')

const password = process.argv[2]

if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs 'your-new-password'")
  process.exit(1)
}

if (password.length < 12) {
  console.error(`Refusing: password is ${password.length} characters. Use at least 12.`)
  process.exit(1)
}

const hash = await bcrypt.hash(password, 12)

console.log('\nAdd this to .env.local (and your host env), then delete ADMIN_PASSWORD:\n')
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`)
