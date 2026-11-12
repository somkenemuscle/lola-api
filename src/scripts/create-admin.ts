import { createInterface } from 'node:readline'
import { z } from 'zod'
import { Role } from '../generated/prisma/enums.js'
import { hashPassword } from '../lib/password.js'
import { prisma } from '../lib/prisma.js'
import { signupSchema } from '../modules/auth/auth.schemas.js'

// Creates an admin account from the command line. There is deliberately no API endpoint for this.
// Dev: npm run admin:create   Production: npm run admin:create:prod

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY })
const lines = rl[Symbol.asyncIterator]()

// readline has no public option to hide input, so swallow its echo while a password is typed.
let muted = false
const output = rl as unknown as { _writeToOutput: (text: string) => void }
const writeToOutput = output._writeToOutput.bind(rl)
output._writeToOutput = (text) => {
  if (!muted) {
    writeToOutput(text)
  }
}

async function ask(question: string, { hidden = false } = {}) {
  process.stdout.write(question)
  muted = hidden
  const { value } = await lines.next()
  muted = false
  if (hidden) {
    process.stdout.write('\n')
  }
  return String(value ?? '')
}

async function main() {
  const fullName = await ask('Full name: ')
  const email = await ask('Email: ')
  const password = await ask('Password: ', { hidden: true })
  const confirmPassword = await ask('Confirm password: ', { hidden: true })
  rl.close()

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match')
  }

  const parsed = signupSchema.safeParse({ fullName, email, password })
  if (!parsed.success) {
    throw new Error(z.prettifyError(parsed.error))
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    throw new Error(`An account with ${parsed.data.email} already exists. Use a different email for the admin.`)
  }

  await prisma.user.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: Role.ADMIN,
    },
  })

  console.log(`Admin account created for ${parsed.data.email}`)
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  rl.close()
  await prisma.$disconnect()
}
