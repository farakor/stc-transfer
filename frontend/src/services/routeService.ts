import api from './api'
import { Route, PopularDestination, PriceCalculation, VehicleType, ApiResponse } from '@/types'
import axios from 'axios'

export interface LocationData {
  id: number
  name: string
  type: string
  coordinates?: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RouteData {
  id: number
  from_location: LocationData
  to_location: LocationData
  distance_km: number
  estimated_duration_minutes: number
  is_active: boolean
}

export interface PriceCalculationRequest {
  fromLocation: string
  toLocation: string
  vehicleType: VehicleType
  distance?: number
}

export class RouteService {
  // Получить все активные маршруты
  static async getActiveRoutes(): Promise<Route[]> {
    const response = await api.get<ApiResponse<Route[]>>('/routes')
    return response.data.data || []
  }

  // Получить популярные направления
  static async getPopularDestinations(): Promise<PopularDestination[]> {
    const response = await api.get<ApiResponse<PopularDestination[]>>('/routes/popular')
    return response.data.data || []
  }

  // Поиск маршрутов
  static async searchRoutes(from: string, to: string): Promise<Route | null> {
    try {
      const response = await api.get<ApiResponse<Route>>(`/routes/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      return response.data.data || null
    } catch (error) {
      console.warn('Route not found, will use base pricing')
      return null
    }
  }

  // Рассчитать стоимость поездки
  static async calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculation> {
    // Преобразуем параметры под ожидаемый формат бэкенда
    const requestData = {
      fromCity: request.fromLocation,
      toCity: request.toLocation,
      vehicleType: request.vehicleType,
      distance: request.distance
    }

    const response = await api.post<ApiResponse<PriceCalculation>>('/routes/calculate-price', requestData)

    if (!response.data.success || !response.data.data) {
      throw new Error('Failed to calculate price')
    }

    return response.data.data
  }

  // Получить маршрут по ID
  static async getRouteById(id: string): Promise<Route | null> {
    try {
      const response = await api.get<ApiResponse<Route>>(`/routes/${id}`)
      return response.data.data || null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  // Получить все локации из API тарифов
  static async getAllLocations(): Promise<LocationData[]> {
    try {
      const response = await api.get<ApiResponse<LocationData[]>>('/admin/tariffs/locations')
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching locations:', error)
      return []
    }
  }

  // Получить все маршруты из API тарифов
  static async getAllRoutes(): Promise<RouteData[]> {
    try {
      const response = await api.get<ApiResponse<RouteData[]>>('/admin/tariffs/routes')
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching routes:', error)
      return []
    }
  }
}
