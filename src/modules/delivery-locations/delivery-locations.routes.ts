import { Router } from 'express'
import { validateBody } from '../../middleware/validate.js'
import * as admin from './delivery-locations.admin.controller.js'
import { createDeliveryLocationSchema, updateDeliveryLocationSchema } from './delivery-locations.schemas.js'
import * as store from './delivery-locations.store.controller.js'

// Mounted under /admin/delivery-locations, behind the admin guard.
export const adminDeliveryLocationsRouter = Router()

adminDeliveryLocationsRouter.get('/', admin.list)
adminDeliveryLocationsRouter.post('/', validateBody(createDeliveryLocationSchema), admin.create)
adminDeliveryLocationsRouter.patch('/:id', validateBody(updateDeliveryLocationSchema), admin.update)
adminDeliveryLocationsRouter.delete('/:id', admin.remove)

// Mounted under /delivery-locations for the store's checkout dropdown: active locations only.
export const deliveryLocationsRouter = Router()

deliveryLocationsRouter.get('/', store.list)
