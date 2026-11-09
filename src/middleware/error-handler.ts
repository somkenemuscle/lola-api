import type { ErrorRequestHandler } from 'express'
import { isHttpError } from 'http-errors'

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err)
    return
  }

  const status = isHttpError(err) ? err.status : 500
  const message = isHttpError(err) && err.expose ? err.message : 'Internal server error'

  if (status >= 500) {
    console.error(err)
  }

  res.status(status).json({ error: { message } })
}
