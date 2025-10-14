import { Router } from 'express'
import { AdminAuthController } from '@/controllers/adminAuthController'
import { authenticate, authorize } from '@/middleware/auth'
import { AdminRole } from '@prisma/client'

const router = Router()

// Публичные роуты
router.post('/login', AdminAuthController.login)

// Защищенные роуты (требуют авторизации)
router.get('/profile', authenticate, AdminAuthController.getProfile)
router.post('/change-password', authenticate, AdminAuthController.changePassword)

// Роуты только для SUPER_ADMIN
router.get('/admins', authenticate, authorize(AdminRole.SUPER_ADMIN), AdminAuthController.getAllAdmins)
router.post('/admins', authenticate, authorize(AdminRole.SUPER_ADMIN), AdminAuthController.createAdmin)
router.put('/admins/:id', authenticate, authorize(AdminRole.SUPER_ADMIN), AdminAuthController.updateAdmin)
router.delete('/admins/:id', authenticate, authorize(AdminRole.SUPER_ADMIN), AdminAuthController.deleteAdmin)

export default router

