import { Router } from 'express'
import { WialonController } from '@/controllers/wialonController'

const router = Router()

// Получить все единицы транспорта из Wialon
router.get('/units', WialonController.getUnits)

// Получить информацию о конкретной единице
router.get('/units/:unitId', WialonController.getUnitById)

// Получить позицию единицы
router.get('/units/:unitId/position', WialonController.getUnitPosition)

// Авторизация в Wialon (для тестирования)
router.post('/login', WialonController.login)

// Выход из Wialon
router.post('/logout', WialonController.logout)

export default router

