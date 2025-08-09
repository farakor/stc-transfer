import { BookingStatus, RouteType, VehicleType } from '@prisma/client'

// Временные данные для заказов
const MOCK_BOOKINGS: any[] = []

export class BookingServiceMock {
  // Создать заказ (моковая версия)
  static async createBooking(data: any) {
    const booking = {
      id: `booking_${Date.now()}`,
      user_id: 1, // Моковый ID пользователя
      vehicle_id: null,
      route_id: null,
      driver_id: null,
      passenger_count: 1,
      total_price: data.totalPrice,
      pickup_location: null,
      dropoff_location: null,
      pickup_time: data.pickupTime ? new Date(data.pickupTime) : null,
      status: BookingStatus.PENDING,
      notes: data.notes || null,
      from_location: data.fromLocation,
      to_location: data.toLocation,
      route_type: RouteType.CUSTOM,
      distance_km: data.distance || 10,
      price: data.totalPrice,
      created_at: new Date(),
      updated_at: new Date(),

      // Связанные данные
      user: {
        id: 1,
        telegram_id: String(data.telegramId),
        first_name: 'Пользователь',
        last_name: `#${data.telegramId}`,
        username: null,
        language_code: 'ru',
        phone: null,
        name: `Пользователь #${data.telegramId}`,
        created_at: new Date(),
        updated_at: new Date()
      },
      vehicle: null,
      driver: null,
      route: null
    }

    MOCK_BOOKINGS.push(booking)

    console.log('✅ Mock booking created:', booking.id)
    return booking
  }

  // Найти заказ по ID
  static async findById(id: string) {
    return MOCK_BOOKINGS.find(b => b.id === id) || null
  }

  // Получить заказы пользователя
  static async getUserBookings(telegramId: string) {
    return MOCK_BOOKINGS.filter(b => b.user.telegram_id === telegramId)
  }

  // Обновить статус заказа
  static async updateStatus(id: string, status: BookingStatus) {
    const booking = MOCK_BOOKINGS.find(b => b.id === id)
    if (booking) {
      booking.status = status
      booking.updated_at = new Date()
    }
    return booking
  }
}
