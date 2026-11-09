import type { RequestHandler } from 'express'
import * as healthService from './health.service.js'

export const liveness: RequestHandler = (_req, res) => {
  res.json(healthService.getLiveness())
}

export const readiness: RequestHandler = async (_req, res) => {
  const { ready, ...body } = await healthService.getReadiness()
  res.status(ready ? 200 : 503).json(body)
}
