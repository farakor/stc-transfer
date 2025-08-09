import api from './api'
import { Booking, BookingFormData, VehicleType, ApiResponse } from '@/types'

export interface CreateBookingRequest {
  telegramId: number
  fromLocation: string
  toLocation: string
  vehicleType: VehicleType
  pickupTime?: string
  notes?: string
  distanceKm?: number
}

export class BookingService {
  // Создать новый заказ
  static async createBooking(request: CreateBookingRequest): Promise<Booking> {
    console.log('📝 Creating booking with data:', request)

    const response = await api.post<ApiResponse<Booking>>('/bookings', request)

    console.log('📨 Booking API response:', response.data)

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create booking')
    }

    return response.data.data
  }

  // Получить заказ по ID
  static async getBookingById(id: string): Promise<Booking | null> {
    try {
      const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`)
      return response.data.data || null
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  // Получить заказы пользователя
  static async getUserBookings(telegramId: number, limit?: number): Promise<Booking[]> {
    const params = limit ? `?limit=${limit}` : ''
    const response = await api.get<ApiResponse<Booking[]>>(`/bookings/user/${telegramId}${params}`)
    return response.data.data || []
  }

  // Обновить статус заказа (для тестирования)
  static async updateBookingStatus(id: string, status: string, notes?: string): Promise<Booking> {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/status`, {
      status,
      notes
    })

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update booking status')
    }

    return response.data.data
  }

  // Получить активные заказы (для админки)
  static async getActiveBookings(): Promise<Booking[]> {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings/active')
    return response.data.data || []
  }

  // Получить статистику заказов
  static async getBookingStats(period?: 'day' | 'week' | 'month'): Promise<any> {
    const params = period ? `?period=${period}` : ''
    const response = await api.get<ApiResponse<any>>(`/bookings/stats${params}`)
    return response.data.data || {}
  }
}

import axios from 'axios'
