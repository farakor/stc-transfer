import api from './api'
import { Vehicle, VehicleDisplayData, VehicleType, ApiResponse } from '@/types'

export class VehicleService {
  // Получить все доступные автомобили
  static async getAvailableVehicles(): Promise<Vehicle[]> {
    const response = await api.get<ApiResponse<Vehicle[]>>('/vehicles')
    return response.data.data || []
  }

  // Получить автомобили по типу
  static async getVehiclesByType(type: VehicleType): Promise<Vehicle[]> {
    const response = await api.get<ApiResponse<Vehicle[]>>(`/vehicles?type=${type}`)
    return response.data.data || []
  }

  // Получить типы автомобилей с описанием
  static async getVehicleTypes(): Promise<VehicleDisplayData[]> {
    const response = await api.get<ApiResponse<VehicleDisplayData[]>>('/vehicles/types')
    return response.data.data || []
  }

  // Получить детали автомобиля
  static async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const response = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`)
      return response.data.data || null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }
}

// Для импорта axios в этом файле
import axios from 'axios'
