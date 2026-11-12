import cloudinaryModule from 'cloudinary'
import { env } from '../config/env.js'

const cloudinary = cloudinaryModule.v2

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

const PRODUCT_IMAGE_FOLDER = 'lola-adeoti/products'
const ALLOWED_FORMATS = 'jpg,jpeg,png,webp,heic'

export const CLOUDINARY_DELIVERY_URL_PREFIX = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/`

// Lets the admin app upload straight to Cloudinary without the file passing through this server.
// The browser posts `fields` plus the file to `uploadUrl`; Cloudinary rejects it after an hour.
export function createUploadSignature() {
  const params = {
    timestamp: Math.round(Date.now() / 1000),
    folder: PRODUCT_IMAGE_FOLDER,
    allowed_formats: ALLOWED_FORMATS,
  }

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    fields: {
      ...params,
      api_key: env.CLOUDINARY_API_KEY,
      signature: cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET),
    },
  }
}

// Best effort: the database is the source of truth, so a failed delete only leaves an unused file behind.
export async function deleteImages(publicIds: string[]) {
  const results = await Promise.allSettled(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId, { invalidate: true })),
  )

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Failed to delete Cloudinary image ${publicIds[index]}:`, result.reason)
    }
  })
}
