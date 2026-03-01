import { Request } from 'express'

export interface AuthRequest extends Request {
  userId?: string
}

export interface GeoData {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  org: string
  timezone: string
}
