import { Router, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { deleteHistorySchema, historyQuerySchema } from '../lib/validators'
import { success, successList, errorResponse, validationError } from '../lib/responses'
import { AuthRequest } from '../types'

const router = Router()

/** @openapi
 * /history:
 *   get:
 *     tags: [History]
 *     summary: Get search history (paginated, filterable)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 50, maximum: 100 } }
 *       - { in: query, name: search, schema: { type: string }, description: Filter by IP address }
 *       - { in: query, name: dateFrom, schema: { type: string, format: date-time } }
 *       - { in: query, name: dateTo, schema: { type: string, format: date-time } }
 *     responses:
 *       200: { description: Paginated history list }
 */
router.get('/history', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = historyQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      validationError(res, parsed.error)
      return
    }

    const { page, limit, search, dateFrom, dateTo } = parsed.data
    const skip = (page - 1) * limit

    const where: Prisma.SearchHistoryWhereInput = { userId: req.userId }

    if (search) {
      where.ipAddress = { contains: search, mode: 'insensitive' }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      }
    }

    const [history, total] = await Promise.all([
      prisma.searchHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: { id: true, ipAddress: true, geoData: true, createdAt: true },
        skip,
        take: limit,
      }),
      prisma.searchHistory.count({ where }),
    ])

    successList(res, history, { total, page, limit, total_pages: Math.ceil(total / limit) })
  } catch {
    errorResponse(res, 500, 'internal_error', 'Failed to fetch history')
  }
})

/** @openapi
 * /history:
 *   delete:
 *     tags: [History]
 *     summary: Delete history entries by IDs
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
 *       200: { description: Entries deleted }
 */
router.delete('/history', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = deleteHistorySchema.safeParse(req.body)
    if (!parsed.success) {
      validationError(res, parsed.error)
      return
    }

    const result = await prisma.searchHistory.deleteMany({
      where: { id: { in: parsed.data.ids }, userId: req.userId },
    })

    success(res, { deleted: result.count })
  } catch {
    errorResponse(res, 500, 'internal_error', 'Failed to delete history')
  }
})

export default router
