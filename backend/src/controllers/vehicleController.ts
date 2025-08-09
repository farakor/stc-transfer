import { Request, Response } from 'express'
import { VehicleService } from '@/services/vehicleService'

export class VehicleController {
  // GET /api/vehicles - Получить список доступных автомобилей
  static async getAvailableVehicles(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query

      const vehicles = await VehicleService.getAvailableVehicles()

      // Преобразуем данные для фронтенда
      const vehicleData = vehicles.map(vehicle => ({
        id: vehicle.id,
        type: vehicle.type,
        name: vehicle.name,
        capacity: vehicle.capacity,
        pricePerKm: vehicle.price_per_km,
        imageUrl: vehicle.image_url,
        description: vehicle.description,
        features: vehicle.features || [],
        isAvailable: true
      }))

      res.json({
        success: true,
        data: vehicleData,
        total: vehicleData.length
      })
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicles'
      })
    }
  }

  // GET /api/vehicles/:id - Получить детали автомобиля
  static async getVehicleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const vehicle = await VehicleService.getVehicleById(parseInt(id))

      if (!vehicle) {
        res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        })
        return
      }

      res.json({
        success: true,
        data: {
          id: vehicle.id,
          type: vehicle.type,
          name: vehicle.name,
          capacity: vehicle.capacity,
          pricePerKm: vehicle.price_per_km,
          imageUrl: vehicle.image_url,
          description: vehicle.description,
          features: vehicle.features || []
        }
      })
    } catch (error) {
      console.error('❌ Error fetching vehicle:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicle details'
      })
    }
  }

  // GET /api/vehicles/types - Получить типы автомобилей с описанием
  static async getVehicleTypes(req: Request, res: Response): Promise<void> {
    try {
      // Пытаемся получить данные из базы
      let vehicleTypes: any[] = []

      try {
        const vehicles = await VehicleService.getAvailableVehicles()

        // Группируем по типам
        vehicleTypes = vehicles.reduce((acc, vehicle) => {
          const existingType = acc.find(v => v.type === vehicle.type)
          if (!existingType) {
            acc.push({
              type: vehicle.type,
              name: vehicle.name,
              description: vehicle.description,
              capacity: vehicle.capacity,
              features: vehicle.features || [],
              imageUrl: vehicle.image_url,
              pricePerKm: vehicle.price_per_km
            })
          }
          return acc
        }, [] as any[])
      } catch (dbError) {
        console.warn('⚠️ Database not available, using mock data:', dbError)

        // Возвращаем моковые данные если база недоступна
        vehicleTypes = [
          {
            type: 'SEDAN',
            name: 'Hongqi EHS 5',
            description: 'Комфортный седан для поездок до 3 пассажиров',
            capacity: 3,
            features: ['Кондиционер', 'Wi-Fi', 'USB зарядка'],
            imageUrl: null,
            pricePerKm: 1500
          },
          {
            type: 'PREMIUM',
            name: 'Hongqi EHS 9',
            description: 'Премиум седан класса люкс для VIP поездок',
            capacity: 3,
            features: ['Кожаные сиденья', 'Панорамная крыша', 'Премиум аудио', 'Wi-Fi'],
            imageUrl: null,
            pricePerKm: 3000
          },
          {
            type: 'MINIVAN',
            name: 'KIA Carnival',
            description: 'Просторный минивэн для группы до 5 человек',
            capacity: 5,
            features: ['Климат-контроль', 'USB зарядка', 'Просторный салон'],
            imageUrl: null,
            pricePerKm: 2000
          },
          {
            type: 'MICROBUS',
            name: 'Mercedes-Benz Sprinter',
            description: 'Микроавтобус для больших групп до 16 человек',
            capacity: 16,
            features: ['Кондиционер', 'Большой багажник', 'Удобные сиденья'],
            imageUrl: null,
            pricePerKm: 2500
          }
        ]
      }

      res.json({
        success: true,
        data: vehicleTypes
      })
    } catch (error) {
      console.error('❌ Error fetching vehicle types:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicle types'
      })
    }
  }
}
