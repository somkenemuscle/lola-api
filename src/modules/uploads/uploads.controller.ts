import type { RequestHandler } from 'express'
import { createUploadSignature } from '../../lib/cloudinary.js'

export const signature: RequestHandler = (_req, res) => {
  res.json(createUploadSignature())
}
