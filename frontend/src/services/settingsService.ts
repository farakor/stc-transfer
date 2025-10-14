import { api } from './api'

export interface SystemSetting {
  id: number
  key: string
  value: string
  description?: string
  category: string
  is_public: boolean
  updated_at: string
}

export interface SettingUpdate {
  key: string
  value: string
  description?: string
  category?: string
  is_public?: boolean
}

export class SettingsService {
  /**
   * Получить все настройки
   */
  static async getAllSettings(): Promise<SystemSetting[]> {
    const response = await api.get('/admin/settings')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки настроек')
  }

  /**
   * Получить категории настроек
   */
  static async getCategories(): Promise<string[]> {
    const response = await api.get('/admin/settings/categories')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки категорий')
  }

  /**
   * Получить настройку по ключу
   */
  static async getSettingByKey(key: string): Promise<SystemSetting> {
    const response = await api.get(`/admin/settings/${key}`)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки настройки')
  }

  /**
   * Создать или обновить настройку
   */
  static async upsertSettings(settings: SettingUpdate[]): Promise<SystemSetting[]> {
    const response = await api.post('/admin/settings', { settings })
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка сохранения настроек')
  }

  /**
   * Обновить настройку
   */
  static async updateSetting(key: string, data: Partial<SettingUpdate>): Promise<SystemSetting> {
    const response = await api.put(`/admin/settings/${key}`, data)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка обновления настройки')
  }

  /**
   * Удалить настройку
   */
  static async deleteSetting(key: string): Promise<void> {
    const response = await api.delete(`/admin/settings/${key}`)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Ошибка удаления настройки')
    }
  }

  /**
   * Инициализировать настройки по умолчанию
   */
  static async initializeDefaultSettings(): Promise<SystemSetting[]> {
    const response = await api.post('/admin/settings/initialize')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка инициализации настроек')
  }
}

export default SettingsService

