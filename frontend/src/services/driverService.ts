import { api } from './api'

export interface Vehicle {
  id: string
  brand: string
  model: string
  licensePlate: string
  type: string
  wialonUnitId?: number
}

export interface Driver {
  id: string
  name: string
  phone: string
  license: string
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY'
  vehicle?: Vehicle
  vehicleId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDriverData {
  name: string
  phone: string
  license: string
  vehicleId?: string
}

export interface UpdateDriverData {
  name?: string
  phone?: string
  license?: string
  vehicleId?: string
  status?: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY'
}

export class DriverService {
  /**
   * Получить всех водителей
   */
  static async getAllDrivers(): Promise<Driver[]> {
    const response = await api.get('/admin/drivers')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки водителей')
  }

  /**
   * Создать водителя
   */
  static async createDriver(data: CreateDriverData): Promise<Driver> {
    const response = await api.post('/admin/drivers', data)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка создания водителя')
  }

  /**
   * Обновить водителя
   */
  static async updateDriver(id: string, data: UpdateDriverData): Promise<Driver> {
    const response = await api.put(`/admin/drivers/${id}`, data)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка обновления водителя')
  }

  /**
   * Удалить водителя
   */
  static async deleteDriver(id: string): Promise<void> {
    const response = await api.delete(`/admin/drivers/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Ошибка удаления водителя')
    }
  }

  /**
   * Получить доступных водителей
   */
  static async getAvailableDrivers(): Promise<Driver[]> {
    const response = await api.get('/admin/drivers/available')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки доступных водителей')
  }
}

export default DriverService

