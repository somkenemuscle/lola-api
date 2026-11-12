import type { AccessTokenPayload } from '../modules/auth/auth.tokens.js'

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload
    }
  }
}
