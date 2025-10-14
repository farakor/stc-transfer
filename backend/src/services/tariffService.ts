import { prisma } from '../utils/prisma'

export interface VehicleModel {
  brand: string
  model: string
  name: string
  type: string
  capacity: number
  features: string[]
  description?: string
  count: number
}

export interface LocationData {
  id: number
  name: string
  type: string
  is_active: boolean
}

export interface RouteData {
  id: number
  from_location: LocationData
  to_location: LocationData
  distance_km?: number | null
  estimated_duration_minutes?: number | null
  is_active: boolean
}

export interface TariffData {
  id: number
  route_id: number
  vehicle_brand: string
  vehicle_model: string
  base_price: number
  price_per_km: number
  minimum_price?: number
  night_surcharge_percent?: number
  holiday_surcharge_percent?: number
  waiting_price_per_minute?: number
  is_active: boolean
  valid_from?: Date
  valid_until?: Date
  route?: RouteData
}

export class TariffService {
  // Получить все уникальные модели автомобилей из таблицы Vehicle
  static async getVehicleModels(): Promise<VehicleModel[]> {
    try {
      const vehicles = await prisma.vehicle.findMany({
        select: {
          brand: true,
          model: true,
          name: true,
          type: true,
          capacity: true,
          features: true,
          description: true
        }
      })

      // Группируем по brand + model
      const modelsMap = new Map<string, VehicleModel>()

      vehicles.forEach(vehicle => {
        if (!vehicle.brand || !vehicle.model) return

        const key = `${vehicle.brand}-${vehicle.model}`

        if (modelsMap.has(key)) {
          const existing = modelsMap.get(key)!
          existing.count += 1
        } else {
          modelsMap.set(key, {
            brand: vehicle.brand,
            model: vehicle.model,
            name: vehicle.name,
            type: vehicle.type,
            capacity: vehicle.capacity,
            features: vehicle.features || [],
            description: vehicle.description || undefined,
            count: 1
          })
        }
      })

      return Array.from(modelsMap.values()).sort((a, b) =>
        a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)
      )
    } catch (error) {
      console.error('Error fetching vehicle models:', error)
      throw new Error('Failed to fetch vehicle models')
    }
  }

  // Получить все локации
  static async getLocations(): Promise<LocationData[]> {
    try {
      return await prisma.location.findMany({
        where: { is_active: true },
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error fetching locations:', error)
      throw new Error('Failed to fetch locations')
    }
  }

  // Получить все маршруты
  static async getRoutes(): Promise<RouteData[]> {
    try {
      const routes = await prisma.tariffRoute.findMany({
        where: { is_active: true },
        include: {
          from_location: true,
          to_location: true
        },
        orderBy: [
          { from_location: { name: 'asc' } },
          { to_location: { name: 'asc' } }
        ]
      })

      return routes.map(route => ({
        id: route.id,
        from_location: route.from_location,
        to_location: route.to_location,
        distance_km: route.distance_km ? Number(route.distance_km) : null,
        estimated_duration_minutes: route.estimated_duration_minutes,
        is_active: route.is_active
      }))
    } catch (error) {
      console.error('Error fetching routes:', error)
      throw new Error('Failed to fetch routes')
    }
  }

  // Получить все тарифы
  static async getTariffs(): Promise<TariffData[]> {
    try {
      const tariffs = await prisma.tariff.findMany({
        include: {
          route: {
            include: {
              from_location: true,
              to_location: true
            }
          }
        },
        orderBy: [
          { route: { from_location: { name: 'asc' } } },
          { route: { to_location: { name: 'asc' } } },
          { vehicle_brand: 'asc' },
          { vehicle_model: 'asc' }
        ]
      })

      return tariffs.map(tariff => ({
        id: tariff.id,
        route_id: tariff.route_id,
        vehicle_brand: tariff.vehicle_brand,
        vehicle_model: tariff.vehicle_model,
        base_price: Number(tariff.base_price),
        price_per_km: Number(tariff.price_per_km),
        minimum_price: tariff.minimum_price ? Number(tariff.minimum_price) : undefined,
        night_surcharge_percent: tariff.night_surcharge_percent ? Number(tariff.night_surcharge_percent) : undefined,
        holiday_surcharge_percent: tariff.holiday_surcharge_percent ? Number(tariff.holiday_surcharge_percent) : undefined,
        waiting_price_per_minute: tariff.waiting_price_per_minute ? Number(tariff.waiting_price_per_minute) : undefined,
        is_active: tariff.is_active,
        valid_from: tariff.valid_from || undefined,
        valid_until: tariff.valid_until || undefined,
        route: tariff.route ? {
          id: tariff.route.id,
          from_location: tariff.route.from_location,
          to_location: tariff.route.to_location,
          distance_km: tariff.route.distance_km ? Number(tariff.route.distance_km) : null,
          estimated_duration_minutes: tariff.route.estimated_duration_minutes,
          is_active: tariff.route.is_active
        } : undefined
      }))
    } catch (error) {
      console.error('Error fetching tariffs:', error)
      throw new Error('Failed to fetch tariffs')
    }
  }

  // Создать или обновить тариф
  static async upsertTariff(data: {
    route_id: number
    vehicle_brand: string
    vehicle_model: string
    base_price: number
    price_per_km: number
    minimum_price?: number
    night_surcharge_percent?: number
    holiday_surcharge_percent?: number
    waiting_price_per_minute?: number
    is_active?: boolean
    valid_from?: Date
    valid_until?: Date
  }): Promise<TariffData> {
    try {
      const tariff = await prisma.tariff.upsert({
        where: {
          route_id_vehicle_brand_vehicle_model: {
            route_id: data.route_id,
            vehicle_brand: data.vehicle_brand,
            vehicle_model: data.vehicle_model
          }
        },
        update: {
          base_price: data.base_price,
          price_per_km: data.price_per_km,
          minimum_price: data.minimum_price,
          night_surcharge_percent: data.night_surcharge_percent,
          holiday_surcharge_percent: data.holiday_surcharge_percent,
          waiting_price_per_minute: data.waiting_price_per_minute,
          is_active: data.is_active ?? true,
          valid_from: data.valid_from,
          valid_until: data.valid_until,
          updated_at: new Date()
        },
        create: {
          route_id: data.route_id,
          vehicle_brand: data.vehicle_brand,
          vehicle_model: data.vehicle_model,
          base_price: data.base_price,
          price_per_km: data.price_per_km,
          minimum_price: data.minimum_price,
          night_surcharge_percent: data.night_surcharge_percent,
          holiday_surcharge_percent: data.holiday_surcharge_percent,
          waiting_price_per_minute: data.waiting_price_per_minute,
          is_active: data.is_active ?? true,
          valid_from: data.valid_from,
          valid_until: data.valid_until
        },
        include: {
          route: {
            include: {
              from_location: true,
              to_location: true
            }
          }
        }
      })

      return {
        id: tariff.id,
        route_id: tariff.route_id,
        vehicle_brand: tariff.vehicle_brand,
        vehicle_model: tariff.vehicle_model,
        base_price: Number(tariff.base_price),
        price_per_km: Number(tariff.price_per_km),
        minimum_price: tariff.minimum_price ? Number(tariff.minimum_price) : undefined,
        night_surcharge_percent: tariff.night_surcharge_percent ? Number(tariff.night_surcharge_percent) : undefined,
        holiday_surcharge_percent: tariff.holiday_surcharge_percent ? Number(tariff.holiday_surcharge_percent) : undefined,
        waiting_price_per_minute: tariff.waiting_price_per_minute ? Number(tariff.waiting_price_per_minute) : undefined,
        is_active: tariff.is_active,
        valid_from: tariff.valid_from || undefined,
        valid_until: tariff.valid_until || undefined,
        route: tariff.route ? {
          id: tariff.route.id,
          from_location: tariff.route.from_location,
          to_location: tariff.route.to_location,
          distance_km: tariff.route.distance_km ? Number(tariff.route.distance_km) : null,
          estimated_duration_minutes: tariff.route.estimated_duration_minutes,
          is_active: tariff.route.is_active
        } : undefined
      }
    } catch (error) {
      console.error('Error upserting tariff:', error)
      throw new Error('Failed to save tariff')
    }
  }

  // Удалить тариф
  static async deleteTariff(id: number): Promise<void> {
    try {
      await prisma.tariff.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting tariff:', error)
      throw new Error('Failed to delete tariff')
    }
  }

  // Создать новую локацию
  static async createLocation(data: {
    name: string
    type: string
    coordinates?: any
  }): Promise<LocationData> {
    try {
      return await prisma.location.create({
        data: {
          name: data.name,
          type: data.type,
          coordinates: data.coordinates
        }
      })
    } catch (error) {
      console.error('Error creating location:', error)
      throw new Error('Failed to create location')
    }
  }

  // Обновить локацию
  static async updateLocation(id: number, data: {
    name?: string
    type?: string
    coordinates?: any
    is_active?: boolean
  }): Promise<LocationData> {
    try {
      return await prisma.location.update({
        where: { id },
        data: {
          name: data.name,
          type: data.type,
          coordinates: data.coordinates,
          is_active: data.is_active
        }
      })
    } catch (error) {
      console.error('Error updating location:', error)
      throw new Error('Failed to update location')
    }
  }

  // Удалить локацию
  static async deleteLocation(id: number): Promise<void> {
    try {
      // Проверяем, есть ли маршруты, использующие эту локацию
      const routesFrom = await prisma.tariffRoute.count({
        where: { from_location_id: id }
      })
      
      const routesTo = await prisma.tariffRoute.count({
        where: { to_location_id: id }
      })

      if (routesFrom > 0 || routesTo > 0) {
        throw new Error(`Cannot delete location: ${routesFrom + routesTo} route(s) are using this location`)
      }

      // Удаляем локацию
      await prisma.location.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting location:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to delete location')
    }
  }

  // Создать новый маршрут
  static async createRoute(data: {
    from_location_id: number
    to_location_id: number
    distance_km?: number
    estimated_duration_minutes?: number
  }): Promise<RouteData> {
    try {
      const route = await prisma.tariffRoute.create({
        data: {
          from_location_id: data.from_location_id,
          to_location_id: data.to_location_id,
          distance_km: data.distance_km,
          estimated_duration_minutes: data.estimated_duration_minutes
        },
        include: {
          from_location: true,
          to_location: true
        }
      })

      return {
        id: route.id,
        from_location: route.from_location,
        to_location: route.to_location,
        distance_km: route.distance_km ? Number(route.distance_km) : null,
        estimated_duration_minutes: route.estimated_duration_minutes,
        is_active: route.is_active
      }
    } catch (error) {
      console.error('Error creating route:', error)
      throw new Error('Failed to create route')
    }
  }

  // Обновить маршрут
  static async updateRoute(id: number, data: {
    from_location_id?: number
    to_location_id?: number
    distance_km?: number
    estimated_duration_minutes?: number
    is_active?: boolean
  }): Promise<RouteData> {
    try {
      const route = await prisma.tariffRoute.update({
        where: { id },
        data: {
          from_location_id: data.from_location_id,
          to_location_id: data.to_location_id,
          distance_km: data.distance_km,
          estimated_duration_minutes: data.estimated_duration_minutes,
          is_active: data.is_active
        },
        include: {
          from_location: true,
          to_location: true
        }
      })

      return {
        id: route.id,
        from_location: route.from_location,
        to_location: route.to_location,
        distance_km: route.distance_km ? Number(route.distance_km) : null,
        estimated_duration_minutes: route.estimated_duration_minutes,
        is_active: route.is_active
      }
    } catch (error) {
      console.error('Error updating route:', error)
      throw new Error('Failed to update route')
    }
  }

  // Удалить маршрут
  static async deleteRoute(id: number): Promise<void> {
    try {
      // Сначала удаляем все связанные тарифы
      await prisma.tariff.deleteMany({
        where: { route_id: id }
      })

      // Затем удаляем сам маршрут
      await prisma.tariffRoute.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting route:', error)
      throw new Error('Failed to delete route')
    }
  }

  // Получить матрицу тарифов для конструктора
  static async getTariffMatrix(): Promise<{
    routes: RouteData[]
    vehicleModels: VehicleModel[]
    tariffs: { [routeId: number]: { [vehicleKey: string]: TariffData } }
  }> {
    try {
      const [routes, vehicleModels, tariffs] = await Promise.all([
        this.getRoutes(),
        this.getVehicleModels(),
        this.getTariffs()
      ])

      // Создаем индекс тарифов по маршруту и модели
      const tariffsIndex: { [routeId: number]: { [vehicleKey: string]: TariffData } } = {}

      tariffs.forEach(tariff => {
        if (!tariffsIndex[tariff.route_id]) {
          tariffsIndex[tariff.route_id] = {}
        }
        const vehicleKey = `${tariff.vehicle_brand}-${tariff.vehicle_model}`
        tariffsIndex[tariff.route_id][vehicleKey] = tariff
      })

      return {
        routes,
        vehicleModels,
        tariffs: tariffsIndex
      }
    } catch (error) {
      console.error('Error fetching tariff matrix:', error)
      throw new Error('Failed to fetch tariff matrix')
    }
  }
}
