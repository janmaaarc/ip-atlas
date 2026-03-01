import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { success, errorResponse } from '../lib/responses'
import { AuthRequest } from '../types'

const router = Router()

/** @openapi
 * /analytics:
 *   get:
 *     tags: [Analytics]
 *     summary: Get search analytics (top countries, orgs, trends)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Analytics data, content: { application/json: { schema: { type: object, properties: { data: { $ref: '#/components/schemas/AnalyticsData' } } } } } }
 */
router.get('/analytics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      errorResponse(res, 401, 'unauthorized', 'Not authenticated')
      return
    }

    const [countryCounts, orgCounts, searchTrend, summary] = await Promise.all([
      prisma.$queryRaw<Array<{ country: string; count: bigint }>>`
        SELECT "geoData"->>'country' AS country, COUNT(*) AS count
        FROM "SearchHistory"
        WHERE "userId" = ${req.userId} AND "geoData"->>'country' IS NOT NULL
        GROUP BY "geoData"->>'country'
        ORDER BY count DESC
        LIMIT 10
      `,
      prisma.$queryRaw<Array<{ org: string; count: bigint }>>`
        SELECT "geoData"->>'org' AS org, COUNT(*) AS count
        FROM "SearchHistory"
        WHERE "userId" = ${req.userId} AND "geoData"->>'org' IS NOT NULL
        GROUP BY "geoData"->>'org'
        ORDER BY count DESC
        LIMIT 10
      `,
      prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE_TRUNC('day', "createdAt") AS date, COUNT(*) AS count
        FROM "SearchHistory"
        WHERE "userId" = ${req.userId}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date DESC
        LIMIT 30
      `,
      prisma.$queryRaw<Array<{ total_searches: bigint; unique_ips: bigint; unique_countries: bigint }>>`
        SELECT
          COUNT(*) AS total_searches,
          COUNT(DISTINCT "ipAddress") AS unique_ips,
          COUNT(DISTINCT "geoData"->>'country') AS unique_countries
        FROM "SearchHistory"
        WHERE "userId" = ${req.userId}
      `,
    ])

    const summaryRow = summary[0] || { total_searches: 0n, unique_ips: 0n, unique_countries: 0n }

    success(res, {
      summary: {
        totalSearches: Number(summaryRow.total_searches),
        uniqueIps: Number(summaryRow.unique_ips),
        uniqueCountries: Number(summaryRow.unique_countries),
      },
      countryCounts: countryCounts.map(r => ({ country: r.country, count: Number(r.count) })),
      orgCounts: orgCounts.map(r => ({ org: r.org, count: Number(r.count) })),
      searchTrend: searchTrend
        .map(r => ({ date: new Date(r.date).toISOString().split('T')[0], count: Number(r.count) }))
        .reverse(),
    })
  } catch {
    errorResponse(res, 500, 'internal_error', 'Failed to fetch analytics')
  }
})

export default router
