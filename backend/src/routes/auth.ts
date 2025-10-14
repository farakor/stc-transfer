import { Router } from 'express'
import { AuthController } from '@/controllers/authController'
import { clientAuth } from '@/middleware/clientAuth'

const router = Router()

// Публичные маршруты (без авторизации)
router.post('/telegram', AuthController.authenticateWithTelegram)
router.post('/driver/telegram', AuthController.authenticateDriverWithTelegram)

// Защищенные маршруты (требуют авторизации)
router.get('/me', clientAuth, AuthController.getCurrentUser)
router.put('/phone', clientAuth, AuthController.updatePhone)
router.post('/logout', clientAuth, AuthController.logout)

export default router
