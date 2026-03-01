import { Router, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { ipSchema, batchIpSchema } from '../lib/validators'
import { success, errorResponse, validationError } from '../lib/responses'
import { AuthRequest, GeoData } from '../types'

const router = Router()

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

async function fetchGeo(ip: string): Promise<GeoData> {
  const res = await fetch(`https://ipinfo.io/${ip}/geo`, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`ipinfo returned ${res.status}`)
  return res.json() as Promise<GeoData>
}

async function getCachedOrFetchGeo(ip: string): Promise<GeoData> {
  const cached = await prisma.geoCache.findUnique({ where: { ip } })

  if (cached && (Date.now() - new Date(cached.cachedAt).getTime()) < CACHE_TTL_MS) {
    return cached.data as unknown as GeoData
  }

  const geoData = await fetchGeo(ip)

  await prisma.geoCache.upsert({
    where: { ip },
    update: { data: geoData as unknown as Prisma.InputJsonValue, cachedAt: new Date() },
    create: { ip, data: geoData as unknown as Prisma.InputJsonValue },
  })

  if (Math.random() < 0.01) {
    const cutoff = new Date(Date.now() - 2 * CACHE_TTL_MS)
    prisma.geoCache.deleteMany({ where: { cachedAt: { lt: cutoff } } }).catch(() => {})
  }

  return geoData
}

function getClientIp(req: AuthRequest): string {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string') return xff.split(',')[0].trim()
  return req.ip || '8.8.8.8'
}

/** @openapi
 * /geo:
 *   get:
 *     tags: [Geo]
 *     summary: Lookup IP geolocation (or get your own)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: ip
 *         schema: { type: string }
 *         description: IPv4 address (omit for your own IP)
 *     responses:
 *       200: { description: Geo data, content: { application/json: { schema: { type: object, properties: { data: { $ref: '#/components/schemas/GeoData' } } } } } }
 *       400: { description: Invalid IP }
 */
router.get('/geo', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ipParam = req.query.ip as string | undefined
    let ip: string

    if (ipParam) {
      const result = ipSchema.safeParse(ipParam)
      if (!result.success) {
        validationError(res, result.error)
        return
      }
      ip = result.data
    } else {
      ip = getClientIp(req)
    }

    const geoData = await getCachedOrFetchGeo(ip)

    if (ipParam && req.userId) {
      await prisma.searchHistory.create({
        data: {
          userId: req.userId,
          ipAddress: ip,
          geoData: geoData as unknown as Prisma.InputJsonValue,
        },
      })
    }

    success(res, geoData)
  } catch {
    errorResponse(res, 500, 'geo_lookup_failed', 'Failed to fetch geolocation')
  }
})

/** @openapi
 * /geo/batch:
 *   post:
 *     tags: [Geo]
 *     summary: Batch lookup multiple IPs (max 25)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ips]
 *             properties:
 *               ips: { type: array, items: { type: string }, maxItems: 25 }
 *     responses:
 *       200: { description: Batch results }
 *       400: { description: Validation error }
 */
router.post('/geo/batch', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = batchIpSchema.safeParse(req.body)
    if (!parsed.success) {
      validationError(res, parsed.error)
      return
    }

    const results = await Promise.allSettled(
      parsed.data.ips.map(async (ip) => {
        const geoData = await getCachedOrFetchGeo(ip)
        if (req.userId) {
          await prisma.searchHistory.create({
            data: {
              userId: req.userId,
              ipAddress: ip,
              geoData: geoData as unknown as Prisma.InputJsonValue,
            },
          })
        }
        return geoData
      })
    )

    const data = results.map((r, i) => ({
      ip: parsed.data.ips[i],
      status: r.status === 'fulfilled' ? 'success' as const : 'error' as const,
      data: r.status === 'fulfilled' ? r.value : null,
      error: r.status === 'rejected' ? 'Lookup failed' : null,
    }))

    success(res, data)
  } catch {
    errorResponse(res, 500, 'geo_lookup_failed', 'Batch lookup failed')
  }
})

export default router
