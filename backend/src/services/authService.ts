import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export class AuthService {
  /**
   * Генерация токена авторизации для пользователя
   */
  static generateAuthToken(userId: number, telegramId: string): string {
    const token = jwt.sign(
      { userId, telegramId, type: 'client' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' } // Токен действителен 30 дней
    )
    return token
  }

  /**
   * Генерация токена авторизации для водителя
   */
  static generateDriverAuthToken(driverId: number, telegramId: string): string {
    const token = jwt.sign(
      { driverId, telegramId, type: 'driver' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' } // Токен действителен 30 дней
    )
    return token
  }

  /**
   * Верификация и проверка данных из Telegram Web App
   */
  static verifyTelegramWebAppData(initData: string): any {
    try {
      const urlParams = new URLSearchParams(initData)
      const hash = urlParams.get('hash')
      urlParams.delete('hash')

      // Создаем строку для проверки
      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')

      // Создаем секретный ключ
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(process.env.TELEGRAM_BOT_TOKEN || '')
        .digest()

      // Вычисляем хеш
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex')

      // Проверяем совпадение хеша
      if (calculatedHash !== hash) {
        throw new Error('Invalid hash')
      }

      // Парсим данные пользователя
      const userJson = urlParams.get('user')
      if (!userJson) {
        throw new Error('User data not found')
      }

      const userData = JSON.parse(userJson)
      return userData
    } catch (error) {
      console.error('❌ Error verifying Telegram Web App data:', error)
      throw new Error('Invalid Telegram Web App data')
    }
  }

  /**
   * Авторизация пользователя через Telegram
   */
  static async authenticateUser(telegramData: {
    id: number
    first_name?: string
    last_name?: string
    username?: string
    language_code?: string
    phone_number?: string
    photo_url?: string
  }) {
    try {
      const telegramId = telegramData.id.toString()

      // Ищем или создаем пользователя
      let user = await prisma.user.findUnique({
        where: { telegram_id: telegramId },
      })

      if (!user) {
        // Создаем нового пользователя
        user = await prisma.user.create({
          data: {
            telegram_id: telegramId,
            first_name: telegramData.first_name || null,
            last_name: telegramData.last_name || null,
            username: telegramData.username || null,
            language_code: telegramData.language_code || 'ru',
            phone: telegramData.phone_number || null,
            photo_url: telegramData.photo_url || null,
            is_phone_verified: !!telegramData.phone_number,
          },
        })
      } else {
        // Обновляем данные пользователя, если что-то изменилось
        const updates: any = {}
        
        if (telegramData.phone_number && !user.phone) {
          updates.phone = telegramData.phone_number
          updates.is_phone_verified = true
        }
        
        if (telegramData.photo_url && user.photo_url !== telegramData.photo_url) {
          updates.photo_url = telegramData.photo_url
        }
        
        if (Object.keys(updates).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updates,
          })
        }
      }

      // Генерируем токен авторизации
      const authToken = this.generateAuthToken(user.id, telegramId)

      // Сохраняем токен в базе данных
      user = await prisma.user.update({
        where: { id: user.id },
        data: { auth_token: authToken },
      })

      return {
        user: {
          id: user.id,
          telegramId: user.telegram_id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          phone: user.phone,
          photoUrl: user.photo_url,
          languageCode: user.language_code,
          isPhoneVerified: user.is_phone_verified,
        },
        authToken,
      }
    } catch (error) {
      console.error('❌ Error authenticating user:', error)
      throw error
    }
  }

  /**
   * Обновление номера телефона пользователя
   */
  static async updateUserPhone(userId: number, phone: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          phone,
          is_phone_verified: true,
        },
      })

      return {
        id: user.id,
        phone: user.phone,
        isPhoneVerified: user.is_phone_verified,
      }
    } catch (error) {
      console.error('❌ Error updating user phone:', error)
      throw error
    }
  }

  /**
   * Получение пользователя по токену
   */
  static async getUserByToken(token: string) {
    try {
      // Проверяем JWT токен
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as any

      // Ищем пользователя по токену
      const user = await prisma.user.findUnique({
        where: { auth_token: token },
      })

      if (!user || user.id !== decoded.userId) {
        throw new Error('Invalid token')
      }

      return {
        id: user.id,
        telegramId: user.telegram_id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        phone: user.phone,
        languageCode: user.language_code,
        isPhoneVerified: user.is_phone_verified,
      }
    } catch (error) {
      console.error('❌ Error getting user by token:', error)
      throw new Error('Invalid or expired token')
    }
  }

  /**
   * Выход пользователя (удаление токена)
   */
  static async logout(userId: number) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { auth_token: null },
      })
      return { success: true }
    } catch (error) {
      console.error('❌ Error logging out user:', error)
      throw error
    }
  }

  // ============ МЕТОДЫ ДЛЯ ВОДИТЕЛЕЙ ============

  /**
   * Верификация и проверка данных водителя из Telegram Web App
   */
  static verifyDriverTelegramWebAppData(initData: string): any {
    try {
      const urlParams = new URLSearchParams(initData)
      const hash = urlParams.get('hash')
      urlParams.delete('hash')

      // Создаем строку для проверки
      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')

      // Создаем секретный ключ для водительского бота
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(process.env.TELEGRAM_DRIVER_BOT_TOKEN || '')
        .digest()

      // Вычисляем хеш
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex')

      // Проверяем совпадение хеша
      if (calculatedHash !== hash) {
        throw new Error('Invalid hash')
      }

      // Парсим данные пользователя
      const userJson = urlParams.get('user')
      if (!userJson) {
        throw new Error('User data not found')
      }

      const userData = JSON.parse(userJson)
      return userData
    } catch (error) {
      console.error('❌ Error verifying driver Telegram Web App data:', error)
      throw new Error('Invalid Telegram Web App data')
    }
  }

  /**
   * Авторизация водителя через Telegram
   */
  static async authenticateDriver(telegramData: {
    id: number
    first_name?: string
    last_name?: string
    username?: string
    language_code?: string
    phone_number?: string
    photo_url?: string
  }) {
    try {
      const telegramId = telegramData.id.toString()

      // Ищем водителя по telegram_id
      let driver = await prisma.driver.findFirst({
        where: { telegram_id: telegramId },
        include: {
          vehicle: true,
          bookings: {
            where: {
              status: {
                in: ['VEHICLE_ASSIGNED', 'CONFIRMED', 'IN_PROGRESS']
              }
            },
            include: {
              user: true
            },
            orderBy: {
              created_at: 'desc'
            }
          }
        }
      })

      if (!driver) {
        throw new Error('Driver not found. Please share your phone number with the bot first.')
      }

      // Обновляем данные водителя, если что-то изменилось
      const updates: any = {}
      
      if (telegramData.first_name && !driver.name) {
        const fullName = `${telegramData.first_name} ${telegramData.last_name || ''}`.trim()
        updates.name = fullName
      }
      
      if (Object.keys(updates).length > 0) {
        driver = await prisma.driver.update({
          where: { id: driver.id },
          data: updates,
          include: {
            vehicle: true,
            bookings: {
              where: {
                status: {
                  in: ['VEHICLE_ASSIGNED', 'CONFIRMED', 'IN_PROGRESS']
                }
              },
              include: {
                user: true
              },
              orderBy: {
                created_at: 'desc'
              }
            }
          }
        })
      }

      // Генерируем токен авторизации
      const authToken = this.generateDriverAuthToken(driver.id, telegramId)

      return {
        driver: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          telegramId: driver.telegram_id,
          license: driver.license,
          status: driver.status,
          vehicle: driver.vehicle ? {
            id: driver.vehicle.id,
            brand: driver.vehicle.brand,
            model: driver.vehicle.model,
            licensePlate: driver.vehicle.license_plate,
            type: driver.vehicle.type
          } : null,
          activeBookings: driver.bookings.map((booking: any) => ({
            id: booking.id,
            bookingNumber: booking.booking_number,
            fromLocation: booking.from_location,
            toLocation: booking.to_location,
            pickupLocation: booking.pickup_location,
            dropoffLocation: booking.dropoff_location,
            pickupTime: booking.pickup_time,
            passengerCount: booking.passenger_count,
            price: booking.price,
            status: booking.status,
            user: {
              name: booking.user.first_name ? 
                `${booking.user.first_name} ${booking.user.last_name || ''}`.trim() : 
                booking.user.username || 'Клиент',
              phone: booking.user.phone,
              photoUrl: booking.user.photo_url,
              username: booking.user.username,
              telegramId: booking.user.telegram_id
            },
            notes: booking.notes,
            distanceKm: booking.distance_km,
            createdAt: booking.created_at
          }))
        },
        authToken
      }
    } catch (error) {
      console.error('❌ Error authenticating driver:', error)
      throw error
    }
  }

  /**
   * Получение водителя по токену
   */
  static async getDriverByToken(token: string) {
    try {
      // Проверяем JWT токен
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as any

      if (decoded.type !== 'driver') {
        throw new Error('Invalid token type')
      }

      // Ищем водителя по id
      const driver = await prisma.driver.findUnique({
        where: { id: decoded.driverId },
        include: {
          vehicle: true,
          bookings: {
            where: {
              status: {
                in: ['VEHICLE_ASSIGNED', 'CONFIRMED', 'IN_PROGRESS']
              }
            },
            include: {
              user: true
            },
            orderBy: {
              created_at: 'desc'
            }
          }
        }
      })

      if (!driver || driver.telegram_id !== decoded.telegramId) {
        throw new Error('Invalid token')
      }

      return {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        telegramId: driver.telegram_id,
        license: driver.license,
        status: driver.status,
        vehicle: driver.vehicle,
        activeBookings: driver.bookings
      }
    } catch (error) {
      console.error('❌ Error getting driver by token:', error)
      throw new Error('Invalid or expired token')
    }
  }

  /**
   * Выход водителя (просто удаляем токен на клиенте)
   */
  static async logoutDriver(driverId: number) {
    try {
      // У водителей мы не храним токен в базе, 
      // поэтому просто возвращаем success
      return { success: true }
    } catch (error) {
      console.error('❌ Error logging out driver:', error)
      throw error
    }
  }
}
