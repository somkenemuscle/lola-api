import { z } from 'zod'
import { CLOUDINARY_DELIVERY_URL_PREFIX } from '../../lib/cloudinary.js'

const MAX_IMAGES = 5
const MAX_SIZES = 20

const imageSchema = z.object({
  publicId: z.string().trim().min(1).max(255),
  url: z
    .url()
    .refine((url) => url.startsWith(CLOUDINARY_DELIVERY_URL_PREFIX), "Image must be hosted on the store's Cloudinary account"),
})

const variantSchema = z.object({
  size: z.string().trim().min(1, 'Size is required').max(20),
  stockQuantity: z.number().int('Stock must be a whole number').min(0).max(100_000),
})

const productFields = {
  name: z.string().trim().min(2, 'Name is too short').max(120, 'Name is too long'),
  description: z.string().trim().max(5_000),
  price: z
    .number()
    .int('Price must be a whole number of kobo')
    .positive('Price must be more than zero')
    .max(2_000_000_000),
  isActive: z.boolean(),
  // Array order is display order: the first image is the main one.
  images: z
    .array(imageSchema)
    .min(1, 'Add at least one image')
    .max(MAX_IMAGES, `A product can have at most ${MAX_IMAGES} images`)
    .refine((images) => new Set(images.map((image) => image.publicId)).size === images.length, 'Each image can only be added once'),
  variants: z
    .array(variantSchema)
    .min(1, 'Add at least one size')
    .max(MAX_SIZES)
    .refine(
      (variants) => new Set(variants.map((variant) => variant.size.toLowerCase())).size === variants.length,
      'Each size can only be listed once',
    ),
}

export const createProductSchema = z.object({
  ...productFields,
  description: productFields.description.default(''),
  isActive: productFields.isActive.default(true),
})

// Every field is optional. Sending `images` or `variants` replaces the whole list.
export const updateProductSchema = z
  .object(productFields)
  .partial()
  .refine((input) => Object.keys(input).length > 0, 'Nothing to update')

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
