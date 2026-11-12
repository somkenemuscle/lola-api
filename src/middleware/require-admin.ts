import type { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { Role } from '../generated/prisma/enums.js'
import { prisma } from '../lib/prisma.js'

// Runs after requireAuth. Checks the database rather than the token's role claim,
// so removing someone's admin role takes effect on their next request.
export const requireAdmin: RequestHandler = async (req, _res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    select: { role: true },
  })

  if (user?.role !== Role.ADMIN) {
    throw createHttpError(403, 'Admin access required')
  }

  next()
}
