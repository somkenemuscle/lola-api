import type { Request, RequestHandler } from 'express'
import { parseIdOrNotFound } from '../../lib/validation.js'
import type { CreateDeliveryLocationInput, UpdateDeliveryLocationInput } from './delivery-locations.schemas.js'
import * as deliveryLocationsService from './delivery-locations.service.js'

function locationId(req: Request) {
  return parseIdOrNotFound(req.params.id, 'Delivery location not found')
}

export const list: RequestHandler = async (_req, res) => {
  res.json({ deliveryLocations: await deliveryLocationsService.listAdminLocations() })
}

export const create: RequestHandler = async (req, res) => {
  const deliveryLocation = await deliveryLocationsService.createLocation(req.body as CreateDeliveryLocationInput)
  res.status(201).json({ deliveryLocation })
}

export const update: RequestHandler = async (req, res) => {
  const deliveryLocation = await deliveryLocationsService.updateLocation(
    locationId(req),
    req.body as UpdateDeliveryLocationInput,
  )
  res.json({ deliveryLocation })
}

export const remove: RequestHandler = async (req, res) => {
  await deliveryLocationsService.deleteLocation(locationId(req))
  res.status(204).end()
}
