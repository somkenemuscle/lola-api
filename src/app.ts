import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import { notFound } from './middleware/not-found.js'
import { apiRouter } from './routes/index.js'

export function createApp() {
  const app = express()

  // Behind Render's proxy: trust its X-Forwarded-For so rate limiting sees real client IPs.
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

  app.use(helmet())
  // maxAge lets browsers cache the CORS preflight instead of repeating it before every request.
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true, maxAge: 600 }))
  app.use(express.json())
  app.use(cookieParser())
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

  app.use('/api/v1', apiRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
