import type { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { z } from 'zod'

export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      throw createHttpError(400, 'Validation failed', { details: z.flattenError(result.error) })
    }

    req.body = result.data
    next()
  }
}
