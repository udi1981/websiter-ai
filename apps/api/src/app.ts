import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { healthRoute } from './routes/health'
import { sitesRoute } from './routes/sites'
import { aiRoute } from './routes/ai'
import { authRoute } from './routes/auth'

export const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}))

// Routes
app.route('/api/health', healthRoute)
app.route('/api/auth', authRoute)
app.route('/api/sites', sitesRoute)
app.route('/api/ai', aiRoute)

// 404
app.notFound((c) => {
  return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404)
})
