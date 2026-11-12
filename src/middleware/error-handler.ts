import type { ErrorRequestHandler } from 'express'
import { isHttpError } from 'http-errors'

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err)
    return
  }

  const status = isHttpError(err) ? err.status : 500
  const exposed = isHttpError(err) && err.expose
  const message = exposed ? err.message : 'Internal server error'
  const details = exposed ? err.details : undefined

  if (status >= 500) {
    console.error(err)
  }

  res.status(status).json({ error: { message, details } })
}
