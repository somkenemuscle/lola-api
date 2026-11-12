import { createHash, randomBytes } from 'node:crypto'
import { jwtVerify, SignJWT } from 'jose'
import { env } from '../../config/env.js'
import type { Role } from '../../generated/prisma/enums.js'

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET)
const ALGORITHM = 'HS256'

export interface AccessTokenPayload {
  userId: string
  role: Role
}

export function signAccessToken({ userId, role }: AccessTokenPayload) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_TTL_MINUTES}m`)
    .sign(accessSecret)
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify<{ role: Role }>(token, accessSecret, {
    algorithms: [ALGORITHM],
  })

  if (!payload.sub) {
    throw new Error('Access token has no subject')
  }

  return { userId: payload.sub, role: payload.role }
}

// Refresh tokens are opaque random strings, not JWTs: they are always checked against the database.
export function generateRefreshToken() {
  return randomBytes(32).toString('base64url')
}

// A fast hash is enough here because the token is long and random, unlike a password.
export function hashRefreshToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
