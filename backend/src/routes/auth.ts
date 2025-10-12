import { Router } from 'express'
import { AuthController } from '@/controllers/authController'
import { authenticate, authorize } from '@/middleware/auth'
import { AdminRole } from '@prisma/client'

const router = Router()

// Публичные маршруты (не требуют аутентификации)
router.post('/login', AuthController.login)

// Защищенные маршруты (требуют аутентификации)
router.get('/profile', authenticate, AuthController.getProfile)
router.post('/change-password', authenticate, AuthController.changePassword)

// Маршруты для управления администраторами (только для SUPER_ADMIN)
router.post(
  '/admins',
  authenticate,
  authorize(AdminRole.SUPER_ADMIN),
  AuthController.createAdmin
)

router.get(
  '/admins',
  authenticate,
  authorize(AdminRole.SUPER_ADMIN),
  AuthController.getAllAdmins
)

router.put(
  '/admins/:id',
  authenticate,
  authorize(AdminRole.SUPER_ADMIN),
  AuthController.updateAdmin
)

router.delete(
  '/admins/:id',
  authenticate,
  authorize(AdminRole.SUPER_ADMIN),
  AuthController.deleteAdmin
)

export default router

