import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
})

const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/

export const ipSchema = z.string().refine(
  (val) => {
    if (!ipv4Pattern.test(val)) return false
    return val.split('.').every(part => {
      const num = parseInt(part, 10)
      return num >= 0 && num <= 255
    })
  },
  { message: 'Please enter a valid IP address' }
)

export const deleteHistorySchema = z.object({
  ids: z.array(z.string()).min(1, 'Select at least one item to delete'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
})

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for confirmation'),
})

export const favoriteSchema = z.object({
  ipAddress: ipSchema,
  label: z.string().max(50).optional(),
})

export const batchIpSchema = z.object({
  ips: z.array(ipSchema).min(1, 'At least one IP is required').max(25, 'Maximum 25 IPs per batch'),
})

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().max(100).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
})

export const updateFavoriteSchema = z.object({
  label: z.string().max(50).nullable(),
})

export const deleteFavoritesSchema = z.object({
  ids: z.array(z.string()).min(1, 'Select at least one item to delete'),
})

export const shareGeoSchema = z.object({
  geoData: z.object({
    ip: z.string(),
    city: z.string().optional().default(''),
    region: z.string().optional().default(''),
    country: z.string().optional().default(''),
    loc: z.string().optional().default(''),
    org: z.string().optional().default(''),
    timezone: z.string().optional().default(''),
  }),
})
