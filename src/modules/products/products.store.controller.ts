import type { RequestHandler } from 'express'
import { paginationSchema } from '../../lib/pagination.js'
import { parseOrThrow } from '../../lib/validation.js'
import * as productsService from './products.service.js'

export const list: RequestHandler = async (req, res) => {
  const pagination = parseOrThrow(paginationSchema, req.query, 'Invalid query parameters')
  res.json(await productsService.listStoreProducts(pagination))
}

export const getBySlug: RequestHandler = async (req, res) => {
  res.json({ product: await productsService.getStoreProduct(String(req.params.slug)) })
}
