import { Request, Response } from 'express'
import { RouteService } from '@/services/routeService'
import { TariffService } from '@/services/tariffService'

export class RouteController {
  // GET /api/routes - Получить список активных маршрутов
  static async getActiveRoutes(req: Request, res: Response): Promise<void> {
    try {
      const routes = await RouteService.getActiveRoutes()

      const routeData = routes.map(route => ({
        id: route.id,
        fromCity: route.from_city,
        toCity: route.to_city,
        distance: route.distance,
        duration: route.duration,
        basePrice: route.base_price,
        isPopular: route.is_popular
      }))

      res.json({
        success: true,
        data: routeData,
        total: routeData.length
      })
    } catch (error) {
      console.error('❌ Error fetching routes:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch routes'
      })
    }
  }

  // POST /api/routes/calculate-price - Рассчитать стоимость поездки
  static async calculatePrice(req: Request, res: Response): Promise<void> {
    try {
      const { fromCity, toCity, vehicleType, passengerCount } = req.body

      if (!fromCity || !toCity || !vehicleType) {
        res.status(400).json({
          success: false,
          error: 'fromCity, toCity, and vehicleType are required'
        })
        return
      }

      const calculation = await RouteService.calculatePrice({
        from: fromCity,
        to: toCity,
        vehicleType,
        distance: undefined
      })

      res.json({
        success: true,
        data: calculation
      })
    } catch (error) {
      console.error('❌ Error calculating price:', error)

      // Отправляем более детальную информацию об ошибке
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate price'

      res.status(500).json({
        success: false,
        error: errorMessage
      })
    }
  }

  // GET /api/routes/popular - Получить популярные направления
  static async getPopularDestinations(req: Request, res: Response): Promise<void> {
    try {
      const destinations = await RouteService.getPopularDestinations()

      res.json({
        success: true,
        data: destinations
      })
    } catch (error) {
      console.error('❌ Error fetching popular destinations:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular destinations'
      })
    }
  }

  // GET /api/routes/:id - Получить маршрут по ID
  static async getRouteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const route = await RouteService.getRouteById(parseInt(id))

      if (!route) {
        res.status(404).json({
          success: false,
          error: 'Route not found'
        })
        return
      }

      res.json({
        success: true,
        data: {
          id: route.id,
          fromCity: route.from_city,
          toCity: route.to_city,
          distance: route.distance,
          duration: route.duration,
          basePrice: route.base_price,
          isPopular: route.is_popular
        }
      })
    } catch (error) {
      console.error('❌ Error fetching route:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch route details'
      })
    }
  }

  // GET /api/routes/search - Поиск маршрутов
  static async searchRoutes(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.query

      if (!from || !to) {
        res.status(400).json({
          success: false,
          error: 'from and to parameters are required'
        })
        return
      }

      const route = await RouteService.findRouteByLocations(String(from), String(to))

      if (!route) {
        res.status(404).json({
          success: false,
          error: 'Route not found'
        })
        return
      }

      res.json({
        success: true,
        data: {
          id: route.id,
          fromCity: route.from_city,
          toCity: route.to_city,
          distance: route.distance,
          duration: route.duration,
          basePrice: route.base_price,
          isPopular: route.is_popular
        }
      })
    } catch (error) {
      console.error('❌ Error searching routes:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to search routes'
      })
    }
  }

  // GET /api/routes/locations - Получить все локации (публичный эндпоинт)
  static async getLocations(req: Request, res: Response): Promise<void> {
    try {
      console.log('📍 Получение локаций (публичный эндпоинт)...')

      const locations = await TariffService.getLocations()

      console.log(`✅ Найдено ${locations.length} локаций`)

      res.json({
        success: true,
        data: locations
      })
    } catch (error) {
      console.error('❌ Ошибка получения локаций:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch locations'
      })
    }
  }

  // GET /api/routes/all-routes - Получить все маршруты (публичный эндпоинт)
  static async getAllRoutes(req: Request, res: Response): Promise<void> {
    try {
      console.log('🛣️ Получение всех маршрутов (публичный эндпоинт)...')

      const routes = await TariffService.getRoutes()

      console.log(`✅ Найдено ${routes.length} маршрутов`)

      res.json({
        success: true,
        data: routes
      })
    } catch (error) {
      console.error('❌ Ошибка получения маршрутов:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch routes'
      })
    }
  }
}
