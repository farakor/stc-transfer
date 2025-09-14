import { Router } from 'express'
import { UserController } from '@/controllers/userController'

const router = Router()

// GET /api/users - Получить пользователей (с поддержкой role=driver)
router.get('/', UserController.getUsers)

// POST /api/users - Создать или обновить пользователя
router.post('/', UserController.createOrUpdateUser)

// GET /api/users/telegram/:telegramId - Получить пользователя по Telegram ID
router.get('/telegram/:telegramId', UserController.getUserByTelegramId)

// PUT /api/users/telegram/:telegramId - Обновить данные пользователя
router.put('/telegram/:telegramId', UserController.updateUser)

// GET /api/users/telegram/:telegramId/stats - Получить статистику пользователя
router.get('/telegram/:telegramId/stats', UserController.getUserStats)

export default router
