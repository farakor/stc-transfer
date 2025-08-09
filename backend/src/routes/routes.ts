import { Router } from 'express'
import { RouteController } from '@/controllers/routeController'

const router = Router()

// GET /api/routes - Получить список активных маршрутов
router.get('/', RouteController.getActiveRoutes)

// GET /api/routes/popular - Получить популярные направления
router.get('/popular', RouteController.getPopularDestinations)

// GET /api/routes/search - Поиск маршрутов
router.get('/search', RouteController.searchRoutes)

// POST /api/routes/calculate-price - Рассчитать стоимость поездки
router.post('/calculate-price', RouteController.calculatePrice)

// GET /api/routes/:id - Получить маршрут по ID
router.get('/:id', RouteController.getRouteById)

export default router
