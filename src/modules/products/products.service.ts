import createHttpError from 'http-errors'
import { Prisma } from '../../generated/prisma/client.js'
import { deleteImages } from '../../lib/cloudinary.js'
import { type Pagination, paginationMeta, toSkipTake } from '../../lib/pagination.js'
import { prisma } from '../../lib/prisma.js'
import type { CreateProductInput, UpdateProductInput } from './products.schemas.js'

const byPosition = { orderBy: { position: 'asc' } } as const
const newestFirst = [{ createdAt: 'desc' }, { id: 'desc' }] satisfies Prisma.ProductOrderByWithRelationInput[]

const adminProductInclude = {
  images: byPosition,
  variants: byPosition,
} satisfies Prisma.ProductInclude

const storeProductSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  images: { select: { url: true, position: true }, ...byPosition },
  variants: { select: { id: true, size: true, stockQuantity: true }, ...byPosition },
} satisfies Prisma.ProductSelect

type StoreProductRow = Prisma.ProductGetPayload<{ select: typeof storeProductSelect }>

function productNotFound() {
  return createHttpError(404, 'Product not found')
}

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

// The store shows whether a size is available, not how many are left.
function toStoreProduct({ variants, ...product }: StoreProductRow) {
  return {
    ...product,
    variants: variants.map(({ stockQuantity, ...variant }) => ({ ...variant, inStock: stockQuantity > 0 })),
  }
}

function slugify(name: string) {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'product'
}

async function uniqueSlug(name: string) {
  const base = slugify(name)
  const taken = new Set(
    (await prisma.product.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } })).map(
      (product) => product.slug,
    ),
  )

  if (!taken.has(base)) {
    return base
  }

  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) {
    suffix++
  }
  return `${base}-${suffix}`
}

export async function listAdminProducts(pagination: Pagination) {
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ include: adminProductInclude, orderBy: newestFirst, ...toSkipTake(pagination) }),
    prisma.product.count(),
  ])

  return { products, pagination: paginationMeta(pagination, total) }
}

export async function getAdminProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: adminProductInclude })

  if (!product) {
    throw productNotFound()
  }

  return product
}

export async function createProduct(input: CreateProductInput) {
  try {
    return await prisma.product.create({
      data: {
        name: input.name,
        slug: await uniqueSlug(input.name),
        description: input.description,
        price: input.price,
        isActive: input.isActive,
        images: { create: input.images.map((image, position) => ({ ...image, position })) },
        variants: { create: input.variants.map((variant, position) => ({ ...variant, position })) },
      },
      include: adminProductInclude,
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw createHttpError(409, 'An image is already used by another product')
    }
    throw error
  }
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  let removedPublicIds: string[] = []

  try {
    const product = await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { id }, include: { images: true } })

      if (!existing) {
        throw productNotFound()
      }

      // The slug stays the same when the name changes, so existing links keep working.
      await tx.product.update({
        where: { id },
        data: { name: input.name, description: input.description, price: input.price, isActive: input.isActive },
      })

      if (input.images) {
        const kept = new Set(input.images.map((image) => image.publicId))
        const currentIds = new Set(existing.images.map((image) => image.publicId))
        removedPublicIds = existing.images.filter((image) => !kept.has(image.publicId)).map((image) => image.publicId)

        await tx.productImage.deleteMany({ where: { productId: id, publicId: { in: removedPublicIds } } })

        for (const [position, image] of input.images.entries()) {
          if (currentIds.has(image.publicId)) {
            await tx.productImage.update({ where: { publicId: image.publicId }, data: { url: image.url, position } })
          } else {
            await tx.productImage.create({ data: { productId: id, ...image, position } })
          }
        }
      }

      if (input.variants) {
        // Sizes are matched by name, so a size that stays keeps its ID (orders will point at it).
        await tx.productVariant.deleteMany({
          where: { productId: id, size: { notIn: input.variants.map((variant) => variant.size) } },
        })

        for (const [position, variant] of input.variants.entries()) {
          await tx.productVariant.upsert({
            where: { productId_size: { productId: id, size: variant.size } },
            create: { productId: id, ...variant, position },
            update: { stockQuantity: variant.stockQuantity, position },
          })
        }
      }

      return tx.product.findUniqueOrThrow({ where: { id }, include: adminProductInclude })
    })

    void deleteImages(removedPublicIds)
    return product
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw createHttpError(409, 'An image is already used by another product')
    }
    throw error
  }
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { images: { select: { publicId: true } } },
  })

  if (!product) {
    throw productNotFound()
  }

  await prisma.product.delete({ where: { id } })
  void deleteImages(product.images.map((image) => image.publicId))
}

export async function listStoreProducts(pagination: Pagination) {
  const where = { isActive: true }
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, select: storeProductSelect, orderBy: newestFirst, ...toSkipTake(pagination) }),
    prisma.product.count({ where }),
  ])

  return { products: products.map(toStoreProduct), pagination: paginationMeta(pagination, total) }
}

export async function getStoreProduct(slug: string) {
  const product = await prisma.product.findUnique({ where: { slug, isActive: true }, select: storeProductSelect })

  if (!product) {
    throw productNotFound()
  }

  return toStoreProduct(product)
}
