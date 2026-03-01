import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, IS_PROD } from './env'

const ACCESS_MAX_AGE = 60 * 60 * 1000
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000

const baseCookie = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: (IS_PROD ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
}

export function setAuthCookies(res: Response, userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' })
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' })

  res.cookie('token', accessToken, { ...baseCookie, maxAge: ACCESS_MAX_AGE })
  res.cookie('refreshToken', refreshToken, { ...baseCookie, maxAge: REFRESH_MAX_AGE })
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('token', { ...baseCookie })
  res.clearCookie('refreshToken', { ...baseCookie })
}
