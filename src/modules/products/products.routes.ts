import { Router } from 'express'
import { validateBody } from '../../middleware/validate.js'
import * as admin from './products.admin.controller.js'
import { createProductSchema, updateProductSchema } from './products.schemas.js'
import * as store from './products.store.controller.js'

// Mounted under /admin/products, behind the admin guard.
export const adminProductsRouter = Router()

adminProductsRouter.get('/', admin.list)
adminProductsRouter.post('/', validateBody(createProductSchema), admin.create)
adminProductsRouter.get('/:id', admin.get)
adminProductsRouter.patch('/:id', validateBody(updateProductSchema), admin.update)
adminProductsRouter.delete('/:id', admin.remove)

// Mounted under /products for the store: active products only.
export const productsRouter = Router()

productsRouter.get('/', store.list)
productsRouter.get('/:slug', store.getBySlug)
