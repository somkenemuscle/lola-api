import { Router } from 'express'
import { signature } from './uploads.controller.js'

// Mounted under /admin/uploads, behind the admin guard.
export const uploadsRouter = Router()

uploadsRouter.post('/signature', signature)
