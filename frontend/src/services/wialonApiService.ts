import api from './api'

export interface WialonUnit {
  id: string
  name: string
  position?: {
    lat: number
    lng: number
    speed?: number
    course?: number
    time?: number
  }
  status?: 'online' | 'offline' | 'moving' | 'stopped'
}

export interface WialonPosition {
  lat: number
  lng: number
}

class WialonApiService {
  /**
   * Получить список всех единиц транспорта из Wialon
   */
  async getUnits(): Promise<WialonUnit[]> {
    try {
      const response = await api.get('/wialon/units')
      return response.data.data || []
    } catch (error) {
      console.error('Failed to get Wialon units:', error)
      throw error
    }
  }

  /**
   * Получить информацию о конкретной единице
   */
  async getUnitById(unitId: string): Promise<WialonUnit | null> {
    try {
      const response = await api.get(`/wialon/units/${unitId}`)
      return response.data.data || null
    } catch (error) {
      console.error(`Failed to get Wialon unit ${unitId}:`, error)
      return null
    }
  }

  /**
   * Получить позицию единицы
   */
  async getUnitPosition(unitId: string): Promise<WialonPosition | null> {
    try {
      const response = await api.get(`/wialon/units/${unitId}/position`)
      return response.data.data || null
    } catch (error) {
      console.error(`Failed to get position for unit ${unitId}:`, error)
      return null
    }
  }

  /**
   * Связать автомобиль с Wialon unit
   */
  async linkVehicleToWialon(vehicleId: number, wialonUnitId: string | null): Promise<boolean> {
    try {
      await api.put(`/vehicles/${vehicleId}/wialon`, { wialonUnitId })
      return true
    } catch (error) {
      console.error(`Failed to link vehicle ${vehicleId} to Wialon unit:`, error)
      return false
    }
  }

  /**
   * Получить список автомобилей с привязкой к Wialon
   */
  async getVehiclesWithWialonMapping(): Promise<any[]> {
    try {
      const response = await api.get('/vehicles/wialon/mapped')
      return response.data.data || []
    } catch (error) {
      console.error('Failed to get vehicles with Wialon mapping:', error)
      return []
    }
  }
}

export default new WialonApiService()

