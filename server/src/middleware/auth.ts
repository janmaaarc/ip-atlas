import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../types'
import { JWT_SECRET } from '../lib/env'
import { errorResponse } from '../lib/responses'

function extractBearerToken(header: string | undefined): string | null {
  if (!header?.startsWith('Bearer ')) return null
  return header.split(' ')[1]
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token || extractBearerToken(req.headers.authorization)

  if (!token) {
    errorResponse(res, 401, 'unauthorized', 'No token provided')
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch {
    errorResponse(res, 401, 'unauthorized', 'Invalid or expired token')
  }
}
