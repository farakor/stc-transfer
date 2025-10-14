/**
 * Сервис для работы с Wialon через backend API
 * Используется в Telegram WebApp где JSONP не работает из-за CSP ограничений
 */

import api from './api'

export interface VehiclePosition {
  lat: number
  lng: number
  speed?: number
  course?: number
  time?: number
}

export interface WialonUnit {
  id: string
  name: string
  position?: VehiclePosition
  status?: 'online' | 'offline' | 'moving' | 'stopped'
}

class WialonBackendService {
  /**
   * Получить информацию о конкретной единице (через публичный tracking API)
   */
  async getUnitById(unitId: string): Promise<WialonUnit | null> {
    try {
      // Используем публичный tracking API, доступный без авторизации
      const response = await api.get(`/tracking/vehicles/${unitId}/position`)
      
      if (response.data.success) {
        return response.data.data
      }
      
      return null
    } catch (error: any) {
      console.error(`Error fetching Wialon unit ${unitId}:`, error)
      return null
    }
  }

  /**
   * Получить текущую позицию единицы (через публичный tracking API)
   */
  async getUnitPosition(unitId: string): Promise<VehiclePosition | null> {
    try {
      const unit = await this.getUnitById(unitId)
      return unit?.position || null
    } catch (error: any) {
      console.error(`Error fetching position for unit ${unitId}:`, error)
      return null
    }
  }
}

export const wialonBackendService = new WialonBackendService()

