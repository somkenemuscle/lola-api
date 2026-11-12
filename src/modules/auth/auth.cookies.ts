import type { CookieOptions, Response } from 'express'
import { env } from '../../config/env.js'

export const ACCESS_COOKIE = 'access_token'
export const REFRESH_COOKIE = 'refresh_token'

const MINUTE_MS = 60 * 1000
const DAY_MS = 24 * 60 * MINUTE_MS

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  domain: env.COOKIE_DOMAIN,
}

const accessOptions: CookieOptions = { ...baseOptions, path: '/' }

// Only sent to the auth endpoints, so the long-lived token travels as little as possible.
const refreshOptions: CookieOptions = { ...baseOptions, path: '/api/v1/auth' }

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...accessOptions,
    maxAge: env.ACCESS_TOKEN_TTL_MINUTES * MINUTE_MS,
  })
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...refreshOptions,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * DAY_MS,
  })
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, accessOptions)
  res.clearCookie(REFRESH_COOKIE, refreshOptions)
}
