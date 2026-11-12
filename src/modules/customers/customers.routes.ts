import { Router } from 'express'
import { list } from './customers.controller.js'

// Mounted under /admin/customers, behind the admin guard.
export const customersRouter = Router()

customersRouter.get('/', list)
