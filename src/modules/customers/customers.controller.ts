import type { RequestHandler } from 'express'
import { paginationSchema } from '../../lib/pagination.js'
import { parseOrThrow } from '../../lib/validation.js'
import * as customersService from './customers.service.js'

export const list: RequestHandler = async (req, res) => {
  const pagination = parseOrThrow(paginationSchema, req.query, 'Invalid query parameters')
  res.json(await customersService.listCustomers(pagination))
}
