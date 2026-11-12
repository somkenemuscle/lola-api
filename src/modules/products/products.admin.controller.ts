import type { Request, RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { z } from 'zod'
import { paginationSchema } from '../../lib/pagination.js'
import { parseOrThrow } from '../../lib/validation.js'
import type { CreateProductInput, UpdateProductInput } from './products.schemas.js'
import * as productsService from './products.service.js'

// A malformed ID can't match any product, so it is reported as not found.
function productId(req: Request) {
  const result = z.uuid().safeParse(req.params.id)

  if (!result.success) {
    throw createHttpError(404, 'Product not found')
  }

  return result.data
}

export const list: RequestHandler = async (req, res) => {
  const pagination = parseOrThrow(paginationSchema, req.query, 'Invalid query parameters')
  res.json(await productsService.listAdminProducts(pagination))
}

export const get: RequestHandler = async (req, res) => {
  res.json({ product: await productsService.getAdminProduct(productId(req)) })
}

export const create: RequestHandler = async (req, res) => {
  const product = await productsService.createProduct(req.body as CreateProductInput)
  res.status(201).json({ product })
}

export const update: RequestHandler = async (req, res) => {
  const product = await productsService.updateProduct(productId(req), req.body as UpdateProductInput)
  res.json({ product })
}

export const remove: RequestHandler = async (req, res) => {
  await productsService.deleteProduct(productId(req))
  res.status(204).end()
}
