import type { RequestHandler } from 'express'
import * as deliveryLocationsService from './delivery-locations.service.js'

export const list: RequestHandler = async (_req, res) => {
  res.json({ deliveryLocations: await deliveryLocationsService.listActiveLocations() })
}
