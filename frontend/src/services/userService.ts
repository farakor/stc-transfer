import { api } from './api'

export interface User {
  id: string
  telegram_id: string
  first_name: string
  last_name?: string
  username?: string
  phone?: string
  created_at: string
  updated_at: string
}

export class UserService {
  /**
   * Получить всех пользователей
   */
  static async getAllUsers(): Promise<User[]> {
    const response = await api.get('/admin/users')
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки пользователей')
  }

  /**
   * Получить детали пользователя
   */
  static async getUserDetails(id: string): Promise<User> {
    const response = await api.get(`/admin/users/${id}`)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.error || 'Ошибка загрузки пользователя')
  }
}

export default UserService
