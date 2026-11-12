import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '../config/env.js'
import { PrismaClient } from '../generated/prisma/client.js'

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 5_000,
  // The adapter treats timestamps as UTC. Pin the session to UTC so stored times are correct
  // even when the server's default timezone isn't (e.g. a local Postgres in WAT).
  options: '-c TimeZone=UTC',
})

export const prisma = new PrismaClient({ adapter })
