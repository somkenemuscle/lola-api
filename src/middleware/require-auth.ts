import type { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { ACCESS_COOKIE } from '../modules/auth/auth.cookies.js'
import { verifyAccessToken } from '../modules/auth/auth.tokens.js'

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token: string | undefined = req.cookies[ACCESS_COOKIE]

  if (!token) {
    throw createHttpError(401, 'Not authenticated')
  }

  try {
    req.auth = await verifyAccessToken(token)
  } catch {
    throw createHttpError(401, 'Access token is invalid or expired')
  }

  next()
}
