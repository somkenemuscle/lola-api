import { prisma } from '../../lib/prisma.js'

export function getLiveness() {
  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }
}

async function isDatabaseUp() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

export async function getReadiness() {
  const databaseUp = await isDatabaseUp()

  return {
    ready: databaseUp,
    status: databaseUp ? 'ok' : 'unavailable',
    checks: { database: databaseUp ? 'up' : 'down' },
    timestamp: new Date().toISOString(),
  }
}
