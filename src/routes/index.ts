import { Router } from 'express'
import { authRouter } from '../modules/auth/auth.routes.js'
import { deliveryLocationsRouter } from '../modules/delivery-locations/delivery-locations.routes.js'
import { healthRouter } from '../modules/health/health.routes.js'
import { productsRouter } from '../modules/products/products.routes.js'
import { adminRouter } from './admin.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/auth', authRouter)
apiRouter.use('/products', productsRouter)
apiRouter.use('/delivery-locations', deliveryLocationsRouter)
apiRouter.use('/admin', adminRouter)
