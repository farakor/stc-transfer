import api from './api'
import { User, ApiResponse } from '@/types'

export interface CreateUserRequest {
  telegramId: number
  name?: string
  phone?: string
  language?: string
}

export interface UpdateUserRequest {
  name?: string
  phone?: string
  language?: string
}

export class UserService {
  // Создать или обновить пользователя
  static async createOrUpdateUser(request: CreateUserRequest): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', request)

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create or update user')
    }

    return response.data.data
  }

  // Получить пользователя по Telegram ID
  static async getUserByTelegramId(telegramId: number): Promise<User | null> {
    try {
      const response = await api.get<ApiResponse<User>>(`/users/telegram/${telegramId}`)
      return response.data.data || null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  // Обновить данные пользователя
  static async updateUser(telegramId: number, request: UpdateUserRequest): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/telegram/${telegramId}`, request)

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update user')
    }

    return response.data.data
  }

  // Получить статистику пользователя
  static async getUserStats(telegramId: number): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(`/users/telegram/${telegramId}/stats`)
      return response.data.data || null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }
}

import axios from 'axios'
