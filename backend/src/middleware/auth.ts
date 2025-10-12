import { Request, Response, NextFunction } from 'express'
import jwt, { SignOptions } from 'jsonwebtoken'
import { prisma } from '@/utils/prisma'
import { AdminRole } from '@prisma/client'

// Расширяем тип Request для добавления информации об администраторе
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: number
        email: string
        role: AdminRole
        firstName: string
        lastName: string
      }
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

// Интерфейс для JWT payload
interface JWTPayload {
  adminId: number
  email: string
  role: AdminRole
}

/**
 * Middleware для проверки JWT токена
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.'
      })
      return
    }

    const token = authHeader.substring(7) // Убираем "Bearer "

    // Верифицируем токен
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    // Получаем данные администратора из БД
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId }
    })

    if (!admin) {
      res.status(401).json({
        success: false,
        error: 'Admin not found'
      })
      return
    }

    if (!admin.is_active) {
      res.status(403).json({
        success: false,
        error: 'Admin account is deactivated'
      })
      return
    }

    // Добавляем информацию об администраторе в request
    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      firstName: admin.first_name,
      lastName: admin.last_name
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
      return
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      })
      return
    }

    console.error('❌ Authentication error:', error)
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    })
  }
}

/**
 * Middleware для проверки роли администратора
 * @param allowedRoles - массив разрешенных ролей
 */
export const authorize = (...allowedRoles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
      return
    }

    // SUPER_ADMIN имеет доступ ко всему
    if (req.admin.role === AdminRole.SUPER_ADMIN) {
      next()
      return
    }

    // Проверяем, есть ли роль пользователя в списке разрешенных
    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      })
      return
    }

    next()
  }
}

/**
 * Генерация JWT токена
 */
export const generateToken = (admin: { id: number; email: string; role: AdminRole }): string => {
  return jwt.sign(
    {
      adminId: admin.id,
      email: admin.email,
      role: admin.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as SignOptions
  )
}

/**
 * Middleware для опциональной аутентификации
 * (не требует токен, но если токен есть - проверяет его)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Токен не предоставлен - это нормально
    next()
    return
  }

  try {
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId }
    })

    if (admin && admin.is_active) {
      req.admin = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        firstName: admin.first_name,
        lastName: admin.last_name
      }
    }
  } catch (error) {
    // Игнорируем ошибки - токен опциональный
  }

  next()
}

