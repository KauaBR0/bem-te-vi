import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import dotenv from 'dotenv'
import { setupRoutes } from './routes/index.js'
import { swaggerConfig } from './config/swagger.ts'

dotenv.config()

const app = new Hono()

app.use('*', cors())

app.get('/swagger', swaggerUI({ url: '/docs' }))
app.get('/docs', (c) => c.json(swaggerConfig))

app.get('/', (c) => c.json({ message: 'Hello, World!' }))

setupRoutes(app)

const port = Number(process.env.PORT) || 3000
console.log(`Server is running on http://localhost:${port}`)
console.log(`Swagger documentation available at http://localhost:${port}/swagger`)

serve({
  fetch: app.fetch,
  port
})
