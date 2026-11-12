import createHttpError from 'http-errors'
import { env } from '../../config/env.js'
import { Prisma } from '../../generated/prisma/client.js'
import type { Role } from '../../generated/prisma/enums.js'
import { hashPassword, verifyPassword } from '../../lib/password.js'
import { prisma } from '../../lib/prisma.js'
import type { LoginInput, SignupInput } from './auth.schemas.js'
import { generateRefreshToken, hashRefreshToken, signAccessToken } from './auth.tokens.js'

const DAY_MS = 24 * 60 * 60 * 1000

// A rotated refresh token presented again within this window is most likely two tabs refreshing
// at the same moment, not theft, so it fails without logging the user out everywhere.
const REUSE_GRACE_MS = 10_000

const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect

// Checked when the email has no account, so that case takes as long as a wrong password.
const dummyPasswordHash = hashPassword('dummy-password-for-timing')

function invalidCredentials() {
  return createHttpError(401, 'Invalid email or password')
}

function notAuthenticated() {
  return createHttpError(401, 'Not authenticated')
}

async function issueTokens(user: { id: string; role: Role }) {
  const refreshToken = generateRefreshToken()

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * DAY_MS),
    },
  })

  const accessToken = await signAccessToken({ userId: user.id, role: user.role })

  return { accessToken, refreshToken }
}

export async function signup(input: SignupInput) {
  const passwordHash = await hashPassword(input.password)

  let user
  try {
    user = await prisma.user.create({
      data: { fullName: input.fullName, email: input.email, passwordHash },
      select: publicUserSelect,
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createHttpError(409, 'An account with this email already exists')
    }
    throw error
  }

  return { user, tokens: await issueTokens(user) }
}

export async function login(input: LoginInput) {
  const found = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...publicUserSelect, passwordHash: true },
  })

  if (!found) {
    await verifyPassword(await dummyPasswordHash, input.password)
    throw invalidCredentials()
  }

  const { passwordHash, ...user } = found

  if (!(await verifyPassword(passwordHash, input.password))) {
    throw invalidCredentials()
  }

  return { user, tokens: await issueTokens(user) }
}

export async function refresh(refreshToken: string | undefined) {
  if (!refreshToken) {
    throw notAuthenticated()
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashRefreshToken(refreshToken) },
    include: { user: { select: publicUserSelect } },
  })

  if (!stored || stored.expiresAt <= new Date()) {
    throw notAuthenticated()
  }

  if (stored.revokedAt) {
    if (Date.now() - stored.revokedAt.getTime() > REUSE_GRACE_MS) {
      // An old token came back: assume it was copied and end every session for this user.
      await prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    }
    throw notAuthenticated()
  }

  // Only one of several concurrent requests can revoke the token; the others fail above next time.
  const { count } = await prisma.refreshToken.updateMany({
    where: { id: stored.id, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  if (count === 0) {
    throw notAuthenticated()
  }

  return { user: stored.user, tokens: await issueTokens(stored.user) }
}

export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) {
    return
  }

  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashRefreshToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect })

  if (!user) {
    throw notAuthenticated()
  }

  return user
}
