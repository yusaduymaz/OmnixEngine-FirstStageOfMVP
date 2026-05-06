import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
    this.name = 'ApiError'
  }
}

export const apiError = {
  unauthorized: (msg = 'Giriş yapmanız gerekiyor.') => new ApiError(401, 'UNAUTHORIZED', msg),
  forbidden: (msg = 'Bu işlem için yetkiniz yok.') => new ApiError(403, 'FORBIDDEN', msg),
  notFound: (msg = 'Kaynak bulunamadı.') => new ApiError(404, 'NOT_FOUND', msg),
  insufficientCredits: (msg = 'Krediniz bu işlem için yetersiz.') =>
    new ApiError(402, 'INSUFFICIENT_CREDITS', msg),
  featureLocked: (feature: string, msg = 'Bu özellik mevcut planınızda yer almıyor.') =>
    new ApiError(403, 'FEATURE_LOCKED', msg, { feature }),
  rateLimit: (msg = 'Çok fazla istek gönderdiniz, lütfen bekleyin.') =>
    new ApiError(429, 'RATE_LIMIT', msg),
  badRequest: (msg = 'Geçersiz istek.', details?: unknown) =>
    new ApiError(400, 'BAD_REQUEST', msg, details),
  internal: (msg = 'Sunucu hatası.', details?: unknown) =>
    new ApiError(500, 'INTERNAL', msg, details),
}

type RouteHandler<Ctx> = (
  req: Request,
  ctx: Ctx,
) => Promise<Response | NextResponse>

export function withErrorHandler<Ctx = unknown>(handler: RouteHandler<Ctx>) {
  return async (req: Request, ctx: Ctx): Promise<Response | NextResponse> => {
    try {
      return await handler(req, ctx)
    } catch (err) {
      return toErrorResponse(err)
    }
  }
}

export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    const flat = err.flatten()
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Girdi doğrulama başarısız.',
        details: flat.fieldErrors,
      },
      { status: 400 },
    )
  }

  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        error: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
      { status: err.status },
    )
  }

  // Bilinmeyen hata
  console.error('[api-error]', err)
  const message =
    err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu.'
  return NextResponse.json(
    {
      error: 'INTERNAL',
      message: process.env.NODE_ENV === 'production' ? 'Sunucu hatası.' : message,
    },
    { status: 500 },
  )
}
