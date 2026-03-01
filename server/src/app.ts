import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './lib/swagger'
import authRoutes from './routes/auth'
import geoRoutes from './routes/geo'
import historyRoutes from './routes/history'
import favoritesRoutes from './routes/favorites'
import analyticsRoutes from './routes/analytics'
import shareRoutes from './routes/share'
import { authMiddleware } from './middleware/auth'

const app = express()

// Swagger docs — mount before helmet to avoid CSP conflicts
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec))

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(cookieParser())
app.use('/api/geo/batch', express.json({ limit: '10kb' }))
app.use(express.json({ limit: '1kb' }))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: { code: 'rate_limit_exceeded', message: 'Too many attempts, try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
})

const geoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: { code: 'rate_limit_exceeded', message: 'Too many requests, try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
})

const shareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { code: 'rate_limit_exceeded', message: 'Too many share requests, try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/login', authLimiter)
app.use('/api/register', authLimiter)
app.use('/api/geo', geoLimiter)
app.use('/api/share', shareLimiter)

app.use('/api', authRoutes)
app.use('/api', shareRoutes)
app.use('/api', authMiddleware, geoRoutes)
app.use('/api', authMiddleware, historyRoutes)
app.use('/api', authMiddleware, favoritesRoutes)
app.use('/api', authMiddleware, analyticsRoutes)

export default app
