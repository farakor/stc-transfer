import { Request, Response } from 'express'
import { TariffService } from '../services/tariffService'

export class TariffController {
  // GET /api/admin/tariffs/matrix - Получить матрицу тарифов для конструктора
  static async getTariffMatrix(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 Получение матрицы тарифов...')

      const matrix = await TariffService.getTariffMatrix()

      console.log(`✅ Загружена матрица: ${matrix.routes.length} маршрутов, ${matrix.vehicleModels.length} моделей`)

      res.json({
        success: true,
        data: matrix
      })
    } catch (error) {
      console.error('❌ Ошибка получения матрицы тарифов:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tariff matrix'
      })
    }
  }

  // GET /api/admin/tariffs/vehicle-models - Получить модели автомобилей
  static async getVehicleModels(req: Request, res: Response): Promise<void> {
    try {
      console.log('🚗 Получение моделей автомобилей...')

      const models = await TariffService.getVehicleModels()

      console.log(`✅ Найдено ${models.length} уникальных моделей`)

      res.json({
        success: true,
        data: models
      })
    } catch (error) {
      console.error('❌ Ошибка получения моделей:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicle models'
      })
    }
  }

  // GET /api/admin/tariffs/locations - Получить локации
  static async getLocations(req: Request, res: Response): Promise<void> {
    try {
      console.log('📍 Получение локаций...')

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

  // GET /api/admin/tariffs/routes - Получить маршруты
  static async getRoutes(req: Request, res: Response): Promise<void> {
    try {
      console.log('🛣️ Получение маршрутов...')

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

  // GET /api/admin/tariffs - Получить все тарифы
  static async getTariffs(req: Request, res: Response): Promise<void> {
    try {
      console.log('💰 Получение тарифов...')

      const tariffs = await TariffService.getTariffs()

      console.log(`✅ Найдено ${tariffs.length} тарифов`)

      res.json({
        success: true,
        data: tariffs
      })
    } catch (error) {
      console.error('❌ Ошибка получения тарифов:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tariffs'
      })
    }
  }

  // POST /api/admin/tariffs - Создать или обновить тариф
  static async upsertTariff(req: Request, res: Response): Promise<void> {
    try {
      console.log('💾 Сохранение тарифа...', req.body)

      const {
        route_id,
        vehicle_brand,
        vehicle_model,
        base_price,
        price_per_km,
        minimum_price,
        night_surcharge_percent,
        holiday_surcharge_percent,
        waiting_price_per_minute,
        is_active,
        valid_from,
        valid_until
      } = req.body

      // Валидация обязательных полей
      if (!route_id || !vehicle_brand || !vehicle_model) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: route_id, vehicle_brand, vehicle_model'
        })
        return
      }

      if (base_price === undefined && price_per_km === undefined) {
        res.status(400).json({
          success: false,
          error: 'Either base_price or price_per_km must be specified'
        })
        return
      }

      const tariff = await TariffService.upsertTariff({
        route_id: parseInt(route_id),
        vehicle_brand,
        vehicle_model,
        base_price: parseFloat(base_price) || 0,
        price_per_km: parseFloat(price_per_km) || 0,
        minimum_price: minimum_price ? parseFloat(minimum_price) : undefined,
        night_surcharge_percent: night_surcharge_percent ? parseFloat(night_surcharge_percent) : undefined,
        holiday_surcharge_percent: holiday_surcharge_percent ? parseFloat(holiday_surcharge_percent) : undefined,
        waiting_price_per_minute: waiting_price_per_minute ? parseFloat(waiting_price_per_minute) : undefined,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
        valid_from: valid_from ? new Date(valid_from) : undefined,
        valid_until: valid_until ? new Date(valid_until) : undefined
      })

      console.log(`✅ Тариф сохранен: ${vehicle_brand} ${vehicle_model}`)

      res.json({
        success: true,
        data: tariff
      })
    } catch (error) {
      console.error('❌ Ошибка сохранения тарифа:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to save tariff'
      })
    }
  }

  // DELETE /api/admin/tariffs/:id - Удалить тариф
  static async deleteTariff(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      console.log(`🗑️ Удаление тарифа ${id}...`)

      await TariffService.deleteTariff(parseInt(id))

      console.log(`✅ Тариф ${id} удален`)

      res.json({
        success: true,
        message: 'Tariff deleted successfully'
      })
    } catch (error) {
      console.error('❌ Ошибка удаления тарифа:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete tariff'
      })
    }
  }

  // POST /api/admin/tariffs/locations - Создать новую локацию
  static async createLocation(req: Request, res: Response): Promise<void> {
    try {
      console.log('📍 Создание новой локации...', req.body)

      const { name, type, coordinates } = req.body

      if (!name || !type) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, type'
        })
        return
      }

      const location = await TariffService.createLocation({
        name,
        type,
        coordinates
      })

      console.log(`✅ Локация создана: ${name}`)

      res.json({
        success: true,
        data: location
      })
    } catch (error) {
      console.error('❌ Ошибка создания локации:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create location'
      })
    }
  }

  // POST /api/admin/tariffs/routes - Создать новый маршрут
  static async createRoute(req: Request, res: Response): Promise<void> {
    try {
      console.log('🛣️ Создание нового маршрута...', req.body)

      const { from_location_id, to_location_id, distance_km, estimated_duration_minutes } = req.body

      if (!from_location_id || !to_location_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: from_location_id, to_location_id'
        })
        return
      }

      if (from_location_id === to_location_id) {
        res.status(400).json({
          success: false,
          error: 'From and to locations cannot be the same'
        })
        return
      }

      const route = await TariffService.createRoute({
        from_location_id: parseInt(from_location_id),
        to_location_id: parseInt(to_location_id),
        distance_km: distance_km ? parseFloat(distance_km) : undefined,
        estimated_duration_minutes: estimated_duration_minutes ? parseInt(estimated_duration_minutes) : undefined
      })

      console.log(`✅ Маршрут создан: ${route.from_location.name} → ${route.to_location.name}`)

      res.json({
        success: true,
        data: route
      })
    } catch (error) {
      console.error('❌ Ошибка создания маршрута:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create route'
      })
    }
  }
}
