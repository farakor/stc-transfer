import api from './api'
import { VehicleType, ApiResponse } from '@/types'

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
  valid_from?: string
  valid_until?: string
  route?: {
    id: number
    from_location: {
      id: number
      name: string
      type: string
    }
    to_location: {
      id: number
      name: string
      type: string
    }
    distance_km: number | null
    estimated_duration_minutes: number
    is_active: boolean
  }
}

export interface VehicleModel {
  brand: string
  model: string
  type: string
  count: number
}

export interface TariffMatrix {
  routes: Array<{
    id: number
    from_location: {
      id: number
      name: string
      type: string
    }
    to_location: {
      id: number
      name: string
      type: string
    }
    distance_km: number | null
    estimated_duration_minutes: number
    is_active: boolean
  }>
  vehicleModels: VehicleModel[]
  tariffs: { [routeId: number]: { [vehicleKey: string]: TariffData } }
}

export class TariffService {
  // Получить матрицу тарифов
  static async getTariffMatrix(): Promise<TariffMatrix> {
    const response = await api.get<ApiResponse<TariffMatrix>>('/admin/tariffs/matrix')
    return response.data.data || { routes: [], vehicleModels: [], tariffs: {} }
  }

  // Получить все тарифы
  static async getTariffs(): Promise<TariffData[]> {
    const response = await api.get<ApiResponse<TariffData[]>>('/admin/tariffs')
    return response.data.data || []
  }

  // Получить модели автомобилей
  static async getVehicleModels(): Promise<VehicleModel[]> {
    const response = await api.get<ApiResponse<VehicleModel[]>>('/admin/tariffs/vehicle-models')
    return response.data.data || []
  }

  // Получить тариф для конкретного маршрута и типа автомобиля
  static async getTariffForRoute(fromLocation: string, toLocation: string, vehicleType: VehicleType): Promise<TariffData | null> {
    try {
      const matrix = await this.getTariffMatrix()
      
      // Найти маршрут
      const route = matrix.routes.find(r => 
        r.from_location.name === fromLocation && r.to_location.name === toLocation
      )
      
      if (!route) {
        return null
      }

      // Найти тариф для этого маршрута и типа автомобиля
      const routeTariffs = matrix.tariffs[route.id]
      if (!routeTariffs) {
        return null
      }

      // Поиск по типу автомобиля
      for (const [vehicleKey, tariff] of Object.entries(routeTariffs)) {
        if (vehicleKey.includes(vehicleType)) {
          return tariff
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching tariff for route:', error)
      return null
    }
  }

  // Получить тарифы для поездок по Самарканду
  static async getSamarkandTariffs(vehicleType: string): Promise<{ perKm: number; hourly: number }> {
    try {
      const tariffs = await this.getTariffs()
      
      // Найти тариф для поездок по Самарканду
      const samarkandTariff = tariffs.find(tariff => 
        tariff.route?.to_location.name === 'Поездка по Самарканду' &&
        (tariff.vehicle_brand + ' ' + tariff.vehicle_model).includes(vehicleType)
      )

      if (samarkandTariff) {
        return {
          perKm: samarkandTariff.price_per_km,
          hourly: samarkandTariff.waiting_price_per_minute ? samarkandTariff.waiting_price_per_minute * 60 : 0
        }
      }

      // Fallback к захардкоженным значениям
      const fallbackTariffs: Record<string, { perKm: number; hourly: number }> = {
        'SEDAN': { perKm: 15000, hourly: 150000 },
        'PREMIUM': { perKm: 40000, hourly: 400000 },
        'BUS': { perKm: 0, hourly: 325000 },
        'MICROBUS': { perKm: 25000, hourly: 200000 },
        'MINIVAN': { perKm: 20000, hourly: 180000 },
      }

      return fallbackTariffs[vehicleType] || { perKm: 0, hourly: 0 }
    } catch (error) {
      console.error('Error fetching Samarkand tariffs:', error)
      
      // Fallback к захардкоженным значениям при ошибке
      const fallbackTariffs: Record<string, { perKm: number; hourly: number }> = {
        'SEDAN': { perKm: 15000, hourly: 150000 },
        'PREMIUM': { perKm: 40000, hourly: 400000 },
        'BUS': { perKm: 0, hourly: 325000 },
        'MICROBUS': { perKm: 25000, hourly: 200000 },
        'MINIVAN': { perKm: 20000, hourly: 180000 },
      }

      return fallbackTariffs[vehicleType] || { perKm: 0, hourly: 0 }
    }
  }
}
