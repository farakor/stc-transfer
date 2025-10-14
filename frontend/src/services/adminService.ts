import { api } from './api';
import {
  BookingStats,
  AdminApiResponse,
  TelegramNotification,
  BookingFilter,
  PaginationParams,
  PaginatedBookings
} from '../types/admin';
import { BookingStatus, Driver } from '../types';

class AdminService {
  private baseUrl = '/admin';

  // Статистика заказов
  async getBookingStats(period?: 'day' | 'week' | 'month'): Promise<AdminApiResponse<BookingStats>> {
    const params = period ? { period } : {};
    const response = await api.get('/bookings/stats', { params });
    return response.data;
  }

  // Получить все заказы с фильтрацией и пагинацией
  async getAllBookings(
    filter?: BookingFilter,
    pagination?: PaginationParams
  ): Promise<AdminApiResponse<PaginatedBookings>> {
    const params = {
      ...filter,
      ...pagination
    };
    const response = await api.get(`${this.baseUrl}/bookings`, { params });
    return response.data;
  }

  // Получить активные заказы
  async getActiveBookings(): Promise<AdminApiResponse<any[]>> {
    console.log('🔍 AdminService.getActiveBookings - вызов API...');
    try {
      const response = await api.get('/bookings/active');
      console.log('📦 AdminService.getActiveBookings - ответ:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AdminService.getActiveBookings - ошибка:', error);
      throw error;
    }
  }

  // Получить все заказы (включая завершенные и отмененные)
  async getAllBookingsForAdmin(): Promise<AdminApiResponse<any[]>> {
    console.log('🔍 AdminService.getAllBookingsForAdmin - вызов API...');
    try {
      const response = await api.get('/bookings/all');
      console.log('📦 AdminService.getAllBookingsForAdmin - ответ:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AdminService.getAllBookingsForAdmin - ошибка:', error);
      throw error;
    }
  }


  // Обновить статус заказа
  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    notes?: string
  ): Promise<AdminApiResponse<any>> {
    const response = await api.put(`/bookings/${bookingId}/status`, { status, notes });
    return response.data;
  }

  // Назначить водителя
  async assignDriver(bookingId: string, driverId: string): Promise<AdminApiResponse<any>> {
    const response = await api.put(`/bookings/${bookingId}/assign-driver`, { driverId });
    return response.data;
  }

  // Получить доступных водителей
  async getAvailableDrivers(): Promise<AdminApiResponse<Driver[]>> {
    const response = await api.get(`${this.baseUrl}/drivers/available`);
    return response.data;
  }

  // Получить список автомобилей
  async getVehicles(): Promise<AdminApiResponse<any[]>> {
    try {
      const response = await api.get('/vehicles/all');
      console.log('📦 Получены автомобили:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка получения автомобилей:', error);
      throw error;
    }
  }

  // Получить всех водителей
  async getAllDrivers(): Promise<AdminApiResponse<Driver[]>> {
    const response = await api.get(`${this.baseUrl}/drivers`);
    return response.data;
  }

  // Создать водителя
  async createDriver(driverData: {
    name: string;
    phone: string;
    license: string;
    vehicleId?: string;
  }): Promise<AdminApiResponse<Driver>> {
    const response = await api.post(`${this.baseUrl}/drivers`, driverData);
    return response.data;
  }

  // Обновить водителя
  async updateDriver(
    driverId: string,
    driverData: Partial<Driver>
  ): Promise<AdminApiResponse<Driver>> {
    const response = await api.put(`${this.baseUrl}/drivers/${driverId}`, driverData);
    return response.data;
  }

  // Удалить водителя
  async deleteDriver(driverId: string): Promise<AdminApiResponse<any>> {
    const response = await api.delete(`${this.baseUrl}/drivers/${driverId}`);
    return response.data;
  }

  // Отправить Telegram уведомление
  async sendTelegramNotification(
    chatId: string,
    message: string,
    type?: 'booking_update' | 'driver_assigned' | 'booking_cancelled'
  ): Promise<AdminApiResponse<any>> {
    return api.post(`${this.baseUrl}/telegram/notify`, {
      chatId,
      message,
      type
    });
  }

  // Получить детали заказа
  async getBookingDetails(bookingId: string): Promise<AdminApiResponse<any>> {
    return api.get(`/api/bookings/${bookingId}`);
  }

  // Получить историю назначений водителей
  async getDriverAssignmentHistory(bookingId: string): Promise<AdminApiResponse<any[]>> {
    return api.get(`${this.baseUrl}/bookings/${bookingId}/driver-history`);
  }

  // Массовые операции
  async bulkUpdateBookings(
    bookingIds: string[],
    action: 'cancel' | 'confirm',
    driverId?: string
  ): Promise<AdminApiResponse<any>> {
    return api.post(`${this.baseUrl}/bookings/bulk-update`, {
      bookingIds,
      action,
      driverId
    });
  }

  // Экспорт данных
  async exportBookings(
    filter?: BookingFilter,
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    const params = { ...filter, format };
    const response = await api.get(`${this.baseUrl}/bookings/export`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  // Получить статистику водителей
  async getDriverStats(): Promise<AdminApiResponse<any>> {
    return api.get(`${this.baseUrl}/drivers/stats`);
  }

  // Получить статистику автомобилей
  async getVehicleStats(): Promise<AdminApiResponse<any>> {
    return api.get(`${this.baseUrl}/vehicles/stats`);
  }

  // Настройки системы
  async getSystemSettings(): Promise<AdminApiResponse<any>> {
    return api.get(`${this.baseUrl}/settings`);
  }

  async updateSystemSettings(settings: any): Promise<AdminApiResponse<any>> {
    return api.put(`${this.baseUrl}/settings`, settings);
  }

  // Логи системы
  async getSystemLogs(
    level?: 'error' | 'warn' | 'info',
    limit: number = 100
  ): Promise<AdminApiResponse<any[]>> {
    return api.get(`${this.baseUrl}/logs`, {
      params: { level, limit }
    });
  }

  // Уведомления для админов
  async getAdminNotifications(): Promise<AdminApiResponse<any[]>> {
    return api.get(`${this.baseUrl}/notifications`);
  }

  async markNotificationAsRead(notificationId: string): Promise<AdminApiResponse<any>> {
    return api.put(`${this.baseUrl}/notifications/${notificationId}/read`);
  }

  // Аналитика
  async getRevenueAnalytics(
    period: 'day' | 'week' | 'month'
  ): Promise<AdminApiResponse<any>> {
    return api.get(`${this.baseUrl}/analytics/revenue`, {
      params: { period }
    });
  }

  async getPopularRoutes(): Promise<AdminApiResponse<any[]>> {
    return api.get(`${this.baseUrl}/analytics/popular-routes`);
  }

  async getDriverPerformance(): Promise<AdminApiResponse<any[]>> {
    return api.get(`${this.baseUrl}/analytics/driver-performance`);
  }

  // Метрики в реальном времени
  async getRealTimeMetrics(): Promise<AdminApiResponse<any>> {
    return api.get(`${this.baseUrl}/analytics/realtime`);
  }

  // Данные о статусах заказов
  async getOrdersStatusData(period?: 'day' | 'week' | 'month'): Promise<AdminApiResponse<any>> {
    const params = period ? { period } : {};
    return api.get(`${this.baseUrl}/analytics/orders-status`, { params });
  }

  // Тестирование Telegram бота
  async testTelegramBot(): Promise<AdminApiResponse<any>> {
    return api.post(`${this.baseUrl}/telegram/test`);
  }

  // Управление пользователями
  async getUsers(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdminApiResponse<any[]>> {
    return api.get(`${this.baseUrl}/users`, { params });
  }

  async getUserDetails(userId: string): Promise<AdminApiResponse<any>> {
    return api.get(`${this.baseUrl}/users/${userId}`);
  }

  async updateUser(userId: string, userData: any): Promise<AdminApiResponse<any>> {
    return api.put(`${this.baseUrl}/users/${userId}`, userData);
  }


  async createVehicle(vehicleData: any): Promise<AdminApiResponse<any>> {
    return api.post(`${this.baseUrl}/vehicles`, vehicleData);
  }

  async updateVehicle(vehicleId: string, vehicleData: any): Promise<AdminApiResponse<any>> {
    return api.put(`${this.baseUrl}/vehicles/${vehicleId}`, vehicleData);
  }

  async deleteVehicle(vehicleId: string): Promise<AdminApiResponse<any>> {
    return api.delete(`${this.baseUrl}/vehicles/${vehicleId}`);
  }

  // Резервное копирование
  async createBackup(): Promise<AdminApiResponse<any>> {
    return api.post(`${this.baseUrl}/backup/create`);
  }

  async getBackups(): Promise<AdminApiResponse<any[]>> {
    return api.get(`${this.baseUrl}/backup/list`);
  }

  async restoreBackup(backupId: string): Promise<AdminApiResponse<any>> {
    return api.post(`${this.baseUrl}/backup/restore/${backupId}`);
  }
}

export const adminService = new AdminService();
