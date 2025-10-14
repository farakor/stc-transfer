import { Request, Response, NextFunction } from 'express'
import { AuthService } from '@/services/authService'

/**
 * Middleware для проверки авторизации клиента
 * Проверяет JWT токен в заголовке Authorization
 */
export const clientAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      })
      return
    }

    const token = authHeader.split(' ')[1]

    try {
      // Проверяем токен и получаем данные пользователя
      const user = await AuthService.getUserByToken(token)

      // Добавляем данные пользователя в request
      ;(req as any).userId = user.id
      ;(req as any).user = user

      next()
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      })
      return
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error)
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    })
  }
}

/**
 * Middleware для опциональной авторизации
 * Проверяет токен, если он есть, но не требует его обязательно
 */
export const optionalClientAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]

      try {
        const user = await AuthService.getUserByToken(token)
        ;(req as any).userId = user.id
        ;(req as any).user = user
      } catch (error) {
        // Игнорируем ошибки при опциональной авторизации
        console.warn('⚠️ Optional auth failed, continuing without auth')
      }
    }

    next()
  } catch (error) {
    // При опциональной авторизации всегда продолжаем
    next()
  }
}

