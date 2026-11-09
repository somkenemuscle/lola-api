import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './lib/prisma.js'

const server = createApp().listen(env.PORT, (error) => {
  if (error) {
    throw error
  }

  console.log(`Server listening on http://localhost:${env.PORT}`)
})

function shutdown(signal: NodeJS.Signals) {
  console.log(`${signal} received, shutting down`)

  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
