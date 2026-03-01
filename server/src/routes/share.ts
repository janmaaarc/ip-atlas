import { Router, Response, Request } from 'express'
import crypto from 'crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { shareGeoSchema } from '../lib/validators'
import { success, errorResponse, validationError } from '../lib/responses'
import { authMiddleware } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = Router()

const SHARE_TTL_MS = 24 * 60 * 60 * 1000

/** @openapi
 * /share:
 *   post:
 *     tags: [Share]
 *     summary: Create a shareable link for geo data (expires in 24h)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [geoData]
 *             properties:
 *               geoData: { $ref: '#/components/schemas/GeoData' }
 *     responses:
 *       201: { description: Share link created }
 */
router.post('/share', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      errorResponse(res, 401, 'unauthorized', 'Not authenticated')
      return
    }

    const parsed = shareGeoSchema.safeParse(req.body)
    if (!parsed.success) {
      validationError(res, parsed.error)
      return
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + SHARE_TTL_MS)

    const link = await prisma.sharedLink.create({
      data: {
        token,
        geoData: parsed.data.geoData as unknown as Prisma.InputJsonValue,
        expiresAt,
      },
      select: { token: true, expiresAt: true },
    })

    success(res, link, 201)
  } catch (err) {
    console.error('Share create error:', err)
    errorResponse(res, 500, 'internal_error', 'Failed to create share link')
  }
})

/** @openapi
 * /shared/{token}:
 *   get:
 *     tags: [Share]
 *     summary: View shared geo data (public, no auth required)
 *     parameters:
 *       - { in: path, name: token, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Shared geo data }
 *       404: { description: Link expired or not found }
 */
router.get('/shared/:token', async (req: Request<{ token: string }>, res: Response): Promise<void> => {
  try {
    const { token } = req.params

    const link = await prisma.sharedLink.findUnique({ where: { token } })

    if (!link || new Date() > link.expiresAt) {
      errorResponse(res, 404, 'not_found', 'Link not found or expired')
      return
    }

    // Lazy cleanup of expired links
    prisma.sharedLink.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {})

    success(res, { geoData: link.geoData, expiresAt: link.expiresAt })
  } catch {
    errorResponse(res, 500, 'internal_error', 'Failed to fetch shared result')
  }
})

export default router
