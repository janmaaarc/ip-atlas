const required = ['JWT_SECRET', 'DATABASE_URL'] as const

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`${key} environment variable is required`)
  }
}

export const JWT_SECRET = process.env.JWT_SECRET!
export const IS_PROD = process.env.NODE_ENV === 'production' || !!process.env.RENDER
