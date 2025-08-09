import { Request, Response } from 'express'

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.path}`
  })
}
