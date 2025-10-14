import { api } from './api'

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

export interface TariffMatrix {
  routes: RouteData[]
  vehicleModels: VehicleModel[]
  tariffs: { [routeId: number]: { [vehicleKey: string]: TariffData } }
}

export class TariffService {
  /**
   * Получить матрицу тарифов (публичный эндпоинт)
   */
  static async getTariffMatrix(): Promise<TariffMatrix> {
    const response = await api.get('/tariffs/matrix')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки матрицы тарифов')
  }

  /**
   * Получить все тарифы (публичный эндпоинт)
   */
  static async getTariffs(): Promise<TariffData[]> {
    const response = await api.get('/tariffs')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки тарифов')
  }

  /**
   * Получить модели автомобилей (публичный эндпоинт)
   */
  static async getVehicleModels(): Promise<VehicleModel[]> {
    const response = await api.get('/tariffs/vehicle-models')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки моделей')
  }

  /**
   * Получить тарифы для поездок по Самарканду
   */
  static async getSamarkandTariffs(vehicleType: string): Promise<TariffData[]> {
    const response = await api.get('/tariffs/samarkand', {
      params: { vehicleType }
    })
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки тарифов')
  }

  /**
   * Получить тариф для конкретного маршрута
   */
  static async getTariffForRoute(fromLocation: string, toLocation: string, vehicleType: string): Promise<TariffData | null> {
    const response = await api.get('/tariffs/route', {
      params: { fromLocation, toLocation, vehicleType }
    })
    if (response.data.success) {
      return response.data.data
    }
    return null
  }

  /**
   * Получить все локации (публичный эндпоинт)
   */
  static async getLocations(): Promise<LocationData[]> {
    const response = await api.get('/tariffs/locations')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки локаций')
  }

  /**
   * Создать локацию (защищенный эндпоинт, только для админ-панели)
   */
  static async createLocation(data: { name: string; type: string }): Promise<LocationData> {
    const response = await api.post('/admin/tariffs/locations', data)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка создания локации')
  }

  /**
   * Обновить локацию (защищенный эндпоинт, только для админ-панели)
   */
  static async updateLocation(id: number, data: {
    name?: string
    type?: string
    is_active?: boolean
  }): Promise<LocationData> {
    const response = await api.put(`/admin/tariffs/locations/${id}`, data)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка обновления локации')
  }

  /**
   * Удалить локацию (защищенный эндпоинт, только для админ-панели)
   */
  static async deleteLocation(id: number): Promise<void> {
    const response = await api.delete(`/admin/tariffs/locations/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Ошибка удаления локации')
    }
  }

  /**
   * Создать маршрут (защищенный эндпоинт, только для админ-панели)
   */
  static async createRoute(data: {
    from_location_id: number
    to_location_id: number
    distance_km: number
    estimated_duration_minutes: number
  }): Promise<RouteData> {
    const response = await api.post('/admin/tariffs/routes', data)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка создания маршрута')
  }

  /**
   * Обновить маршрут (защищенный эндпоинт, только для админ-панели)
   */
  static async updateRoute(id: number, data: {
    from_location_id?: number
    to_location_id?: number
    distance_km?: number
    estimated_duration_minutes?: number
    is_active?: boolean
  }): Promise<RouteData> {
    const response = await api.put(`/admin/tariffs/routes/${id}`, data)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка обновления маршрута')
  }

  /**
   * Удалить маршрут (защищенный эндпоинт, только для админ-панели)
   */
  static async deleteRoute(id: number): Promise<void> {
    const response = await api.delete(`/admin/tariffs/routes/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Ошибка удаления маршрута')
    }
  }

  /**
   * Сохранить тариф (защищенный эндпоинт, только для админ-панели)
   */
  static async saveTariff(data: Partial<TariffData>): Promise<TariffData> {
    const response = await api.post('/admin/tariffs', data)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка сохранения тарифа')
  }
}

export default TariffService
