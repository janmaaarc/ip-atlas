import { Response } from 'express'
import { ZodError } from 'zod'

interface ErrorDetail {
  field: string
  message: string
}

export function success(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ data })
}

export function successList(res: Response, data: unknown[], meta: Record<string, number>) {
  return res.json({ data, meta })
}

export function errorResponse(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: ErrorDetail[],
) {
  const body: { error: { code: string; message: string; details?: ErrorDetail[] } } = {
    error: { code, message },
  }
  if (details?.length) {
    body.error.details = details
  }
  return res.status(status).json(body)
}

export function validationError(res: Response, zodError: ZodError) {
  const details = zodError.errors.map(e => ({
    field: e.path.join('.'),
    message: e.message,
  }))

  return errorResponse(res, 400, 'validation_error', 'Validation failed', details)
}
