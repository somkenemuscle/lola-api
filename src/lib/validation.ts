import createHttpError from 'http-errors'
import { z } from 'zod'

export function parseOrThrow<T extends z.ZodType>(schema: T, data: unknown, message = 'Validation failed'): z.output<T> {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw createHttpError(400, message, { details: z.flattenError(result.error) })
  }

  return result.data
}

// A malformed ID can't match any record, so it is reported as not found rather than invalid.
export function parseIdOrNotFound(id: unknown, notFoundMessage: string) {
  const result = z.uuid().safeParse(id)

  if (!result.success) {
    throw createHttpError(404, notFoundMessage)
  }

  return result.data
}
