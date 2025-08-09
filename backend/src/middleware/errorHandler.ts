import { Request, Response, NextFunction } from 'express'

interface ErrorWithStatus extends Error {
  status?: number
  statusCode?: number
}

export function errorHandler(
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  console.error(`❌ Error ${status}: ${message}`, {
    url: req.url,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
