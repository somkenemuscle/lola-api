import { Router } from 'express'
import { requireAdmin } from '../middleware/require-admin.js'
import { requireAuth } from '../middleware/require-auth.js'
import { customersRouter } from '../modules/customers/customers.routes.js'
import { adminDeliveryLocationsRouter } from '../modules/delivery-locations/delivery-locations.routes.js'
import { adminProductsRouter } from '../modules/products/products.routes.js'
import { uploadsRouter } from '../modules/uploads/uploads.routes.js'

// Every admin route is mounted on this router, so it is protected without per-route checks.
export const adminRouter = Router()

adminRouter.use(requireAuth, requireAdmin)

adminRouter.use('/products', adminProductsRouter)
adminRouter.use('/customers', customersRouter)
adminRouter.use('/delivery-locations', adminDeliveryLocationsRouter)
adminRouter.use('/uploads', uploadsRouter)
