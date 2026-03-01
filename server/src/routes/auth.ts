import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { JWT_SECRET } from '../lib/env'
import { setAuthCookies, clearAuthCookies } from '../lib/cookies'
import { loginSchema, registerSchema, changePasswordSchema, deleteAccountSchema } from '../lib/validators'
import { success, errorResponse, validationError } from '../lib/responses'
import { authMiddleware } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = Router()

/**
 * @openapi
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, content: { application/json: { schema: { type: object, properties: { data: { type: object, properties: { id: { type: string }, email: { type: string } } } } } } } }
 *       401: { description: Invalid credentials }
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      validationError(res, parsed.error)
      return
    }

    const { email, password } = parsed.data
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      errorResponse(res, 401, 'invalid_credentials', 'Invalid email or password')
      return
    }

    setAuthCookies(res, user.id)
    success(res, { id: user.id, email: user.email })
  } catch {
    errorResponse(res, 500, 'internal_error', 'Something went wrong')
  }
})

/**
 * @openapi
 * /register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: Account created }
 *       409: { description: Email already registered }
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      validationError(res, parsed.error)
      return
    }

    const { email, password } = parsed.data
    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, password: hashed },
    })

    setAuthCookies(res, user.id)
    success(res, { id: user.id, email: user.email }, 201)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      errorResponse(res, 409, 'email_taken', 'Email already registered')
      return
    }
    errorResponse(res, 500, 'internal_error', 'Something went wrong')
  }
})

/** @openapi
 * /logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and clear auth cookies
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookies(res)
  success(res, null)
})

/** @openapi
 * /me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user data }
 *       401: { description: Not authenticated }
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      errorResponse(res, 401, 'unauthorized', 'Not authenticated')
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true },
    })

    if (!user) {
      clearAuthCookies(res)
      errorResponse(res, 401, 'unauthorized', 'User not found')
      return
    }

    success(res, user)
  } catch {
    errorResponse(res, 500, 'internal_error', 'Something went wrong')
  }
})

/** @openapi
 * /refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh cookie
 *     responses:
 *       200: { description: Tokens refreshed }
 *       401: { description: Invalid refresh token }
 */
router.post('/refresh', (req: Request, res: Response): void => {
  const refreshToken = req.cookies?.refreshToken
  if (!refreshToken) {
    errorResponse(res, 401, 'unauthorized', 'No refresh token')
    return
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; type?: string }
    if (decoded.type !== 'refresh') {
      errorResponse(res, 401, 'unauthorized', 'Invalid token type')
      return
    }
    setAuthCookies(res, decoded.userId)
    success(res, null)
  } catch {
    clearAuthCookies(res)
    errorResponse(res, 401, 'unauthorized', 'Invalid or expired refresh token')
  }
})

/** @openapi
 * /password:
 *   patch:
 *     tags: [Auth]
 *     summary: Change password
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Password changed }
 *       401: { description: Current password incorrect }
 */
router.patch('/password', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      errorResponse(res, 401, 'unauthorized', 'Not authenticated')
      return
    }

    const parsed = changePasswordSchema.safeParse(req.body)
    if (!parsed.success) {
      validationError(res, parsed.error)
      return
    }

    const { currentPassword, newPassword } = parsed.data
    const user = await prisma.user.findUnique({ where: { id: req.userId } })

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      errorResponse(res, 401, 'invalid_credentials', 'Current password is incorrect')
      return
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } })

    setAuthCookies(res, user.id)
    success(res, null)
  } catch {
    errorResponse(res, 500, 'internal_error', 'Something went wrong')
  }
})

/** @openapi
 * /account:
 *   delete:
 *     tags: [Auth]
 *     summary: Delete account permanently
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string }
 *     responses:
 *       200: { description: Account deleted }
 *       401: { description: Password incorrect }
 */
router.delete('/account', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      errorResponse(res, 401, 'unauthorized', 'Not authenticated')
      return
    }

    const parsed = deleteAccountSchema.safeParse(req.body)
    if (!parsed.success) {
      validationError(res, parsed.error)
      return
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } })

    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      errorResponse(res, 401, 'invalid_credentials', 'Password is incorrect')
      return
    }

    await prisma.user.delete({ where: { id: req.userId } })
    clearAuthCookies(res)
    success(res, null)
  } catch {
    errorResponse(res, 500, 'internal_error', 'Something went wrong')
  }
})

export default router
