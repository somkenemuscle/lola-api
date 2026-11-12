import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import createHttpError from 'http-errors'
import { requireAuth } from '../../middleware/require-auth.js'
import { validateBody } from '../../middleware/validate.js'
import { login, logout, me, refresh, signup } from './auth.controller.js'
import { loginSchema, signupSchema } from './auth.schemas.js'

// Generous because mobile carriers often put many customers behind one IP address.
const credentialsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(createHttpError(429, 'Too many attempts, please try again later'))
  },
})

export const authRouter = Router()

authRouter.post('/signup', credentialsRateLimit, validateBody(signupSchema), signup)
authRouter.post('/login', credentialsRateLimit, validateBody(loginSchema), login)
authRouter.post('/refresh', refresh)
authRouter.post('/logout', logout)
authRouter.get('/me', requireAuth, me)
