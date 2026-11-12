import { Router } from 'express'
import { requireAdmin } from '../middleware/require-admin.js'
import { requireAuth } from '../middleware/require-auth.js'

// Every admin route is mounted on this router, so it is protected without per-route checks.
export const adminRouter = Router()

adminRouter.use(requireAuth, requireAdmin)
