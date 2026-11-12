import { z } from 'zod'

const locationFields = {
  name: z.string().trim().min(2, 'Name is too short').max(60, 'Name is too long'),
  fee: z
    .number()
    .int('Fee must be a whole number of kobo')
    .min(0, 'Fee cannot be negative')
    .max(100_000_000),
  isActive: z.boolean(),
}

export const createDeliveryLocationSchema = z.object({
  ...locationFields,
  isActive: locationFields.isActive.default(true),
})

export const updateDeliveryLocationSchema = z
  .object(locationFields)
  .partial()
  .refine((input) => Object.keys(input).length > 0, 'Nothing to update')

export type CreateDeliveryLocationInput = z.infer<typeof createDeliveryLocationSchema>
export type UpdateDeliveryLocationInput = z.infer<typeof updateDeliveryLocationSchema>
