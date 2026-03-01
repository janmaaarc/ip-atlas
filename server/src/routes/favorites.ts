import { Router, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { success, errorResponse, validationError } from '../lib/responses'
import { favoriteSchema, updateFavoriteSchema, deleteFavoritesSchema } from '../lib/validators'
import { AuthRequest } from '../types'

const router = Router()

/** @openapi
 * /favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: List all favorites
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Favorites list }
 */
router.get('/favorites', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      errorResponse(res, 401, 'unauthorized', 'Not authenticated')
      return
    }

    const favorites = await prisma.favoriteIp.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, ipAddress: true, label: true, createdAt: true },
    })

    success(res, favorites)
  } catch {
    errorResponse(res, 500, 'internal_error', 'Something went wrong')
  }
})

/** @openapi
 * /favorites:
 *   post:
 *     tags: [Favorites]
 *     summary: Add IP to favorites
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ipAddress]
 *             properties:
 *               ipAddress: { type: string }
 *               label: { type: string, maxLength: 50 }
 *     responses:
 *       201: { description: Favorite created }
 *       409: { description: Already favorited }
 */
router.post('/favorites', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      errorResponse(res, 401, 'unauthorized', 'Not authenticated')
      return
    }

    const parsed = favoriteSchema.safeParse(req.body)
    if (!parsed.success) {
      validationError(res, parsed.error)
      return
    }

    const favorite = await prisma.favoriteIp.create({
      data: {
        userId: req.userId,
        ipAddress: parsed.data.ipAddress,
        label: parsed.data.label || null,
      },
      select: { id: true, ipAddress: true, label: true, createdAt: true },
    })

    success(res, favorite, 201)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      errorResponse(res, 409, 'already_favorited', 'IP is already in favorites')
      return
    }
    errorResponse(res, 500, 'internal_error', 'Something went wrong')
  }
})

/** @openapi
 * /favorites/{id}:
 *   patch:
 *     tags: [Favorites]
 *     summary: Update favorite label
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label]
 *             properties:
 *               label: { type: string, nullable: true, maxLength: 50 }
 *     responses:
 *       200: { description: Label updated }
 *       404: { description: Favorite not found }
 */
router.patch('/favorites/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      errorResponse(res, 401, 'unauthorized', 'Not authenticated')
      return
    }

    const parsed = updateFavoriteSchema.safeParse(req.body)
    if (!parsed.success) {
      validationError(res, parsed.error)
      return
    }

    const favId = req.params.id as string
    const favorite = await prisma.favoriteIp.findFirst({
      where: { id: favId, userId: req.userId },
    })

    if (!favorite) {
      errorResponse(res, 404, 'not_found', 'Favorite not found')
      return
    }

    const updated = await prisma.favoriteIp.update({
      where: { id: favId },
      data: { label: parsed.data.label },
      select: { id: true, ipAddress: true, label: true, createdAt: true },
    })

    success(res, updated)
  } catch {
    errorResponse(res, 500, 'internal_error', 'Something went wrong')
  }
})

/** @openapi
 * /favorites/bulk:
 *   delete:
 *     tags: [Favorites]
 *     summary: Delete multiple favorites
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Favorites deleted }
 */
router.delete('/favorites/bulk', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      errorResponse(res, 401, 'unauthorized', 'Not authenticated')
      return
    }

    const parsed = deleteFavoritesSchema.safeParse(req.body)
    if (!parsed.success) {
      validationError(res, parsed.error)
      return
    }

    const result = await prisma.favoriteIp.deleteMany({
      where: { id: { in: parsed.data.ids }, userId: req.userId },
    })

    success(res, { deleted: result.count })
  } catch {
    errorResponse(res, 500, 'internal_error', 'Something went wrong')
  }
})

/** @openapi
 * /favorites/{id}:
 *   delete:
 *     tags: [Favorites]
 *     summary: Remove a single favorite
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Favorite removed }
 *       404: { description: Favorite not found }
 */
router.delete('/favorites/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      errorResponse(res, 401, 'unauthorized', 'Not authenticated')
      return
    }

    const favId = req.params.id as string
    const favorite = await prisma.favoriteIp.findFirst({
      where: { id: favId, userId: req.userId },
    })

    if (!favorite) {
      errorResponse(res, 404, 'not_found', 'Favorite not found')
      return
    }

    await prisma.favoriteIp.delete({ where: { id: favId } })
    success(res, null)
  } catch {
    errorResponse(res, 500, 'internal_error', 'Something went wrong')
  }
})

export default router
