import { prisma } from '@/utils/prisma'
import { SettingType } from '@prisma/client'

export interface CreateSettingData {
  key: string
  value: string
  type: SettingType
  category: string
  description?: string
}

export class SettingsService {
  // Получить все настройки
  static async getAllSettings() {
    return await prisma.systemSetting.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })
  }

  // Получить настройки по категории
  static async getSettingsByCategory(category: string) {
    return await prisma.systemSetting.findMany({
      where: { category },
      orderBy: { key: 'asc' }
    })
  }

  // Получить настройку по ключу
  static async getSettingByKey(key: string) {
    return await prisma.systemSetting.findUnique({
      where: { key }
    })
  }

  // Создать или обновить настройку
  static async upsertSetting(data: CreateSettingData) {
    return await prisma.systemSetting.upsert({
      where: { key: data.key },
      update: {
        value: data.value,
        type: data.type,
        category: data.category,
        description: data.description,
        updated_at: new Date()
      },
      create: {
        key: data.key,
        value: data.value,
        type: data.type,
        category: data.category,
        description: data.description
      }
    })
  }

  // Массовое создание/обновление настроек
  static async upsertManySettings(settings: CreateSettingData[]) {
    const results = []

    for (const setting of settings) {
      const result = await this.upsertSetting(setting)
      results.push(result)
    }

    return results
  }

  // Удалить настройку
  static async deleteSetting(key: string) {
    try {
      await prisma.systemSetting.delete({
        where: { key }
      })
      return true
    } catch (error) {
      console.error('Error deleting setting:', error)
      return false
    }
  }

  // Получить значение настройки с типизацией
  static async getSettingValue<T = any>(key: string, defaultValue?: T): Promise<T> {
    try {
      const setting = await this.getSettingByKey(key)

      if (!setting) {
        return defaultValue as T
      }

      switch (setting.type) {
        case 'NUMBER':
          return parseFloat(setting.value) as T
        case 'BOOLEAN':
          return (setting.value === 'true') as T
        case 'JSON':
          return JSON.parse(setting.value) as T
        default:
          return setting.value as T
      }
    } catch (error) {
      console.error(`Error getting setting value for key ${key}:`, error)
      return defaultValue as T
    }
  }

  // Инициализация настроек по умолчанию
  static async initializeDefaultSettings() {
    const defaultSettings: CreateSettingData[] = [
      // Тарифы
      {
        key: 'basePrice',
        value: '20000',
        type: 'NUMBER',
        category: 'tariffs',
        description: 'Базовая стоимость поездки в сумах'
      },
      {
        key: 'minPrice',
        value: '15000',
        type: 'NUMBER',
        category: 'tariffs',
        description: 'Минимальная стоимость поездки в сумах'
      },
      {
        key: 'perKmRates',
        value: JSON.stringify({
          SEDAN: 1500,
          PREMIUM: 3000,
          MINIVAN: 2000,
          MICROBUS: 2500,
          BUS: 3000
        }),
        type: 'JSON',
        category: 'tariffs',
        description: 'Тарифы за километр по типам транспорта'
      },
      {
        key: 'nightSurcharge',
        value: '20',
        type: 'NUMBER',
        category: 'tariffs',
        description: 'Ночная надбавка в процентах (22:00-06:00)'
      },
      {
        key: 'holidaySurcharge',
        value: '30',
        type: 'NUMBER',
        category: 'tariffs',
        description: 'Праздничная надбавка в процентах'
      },
      {
        key: 'waitingTimeRate',
        value: '500',
        type: 'NUMBER',
        category: 'tariffs',
        description: 'Тариф ожидания в сумах за минуту'
      },

      // Уведомления
      {
        key: 'telegramBotToken',
        value: '',
        type: 'STRING',
        category: 'notifications',
        description: 'Токен Telegram бота'
      },
      {
        key: 'dispatcherChatId',
        value: '',
        type: 'STRING',
        category: 'notifications',
        description: 'Chat ID диспетчера для уведомлений'
      },
      {
        key: 'newOrderNotifications',
        value: 'true',
        type: 'BOOLEAN',
        category: 'notifications',
        description: 'Отправлять уведомления о новых заказах'
      },
      {
        key: 'statusUpdateNotifications',
        value: 'true',
        type: 'BOOLEAN',
        category: 'notifications',
        description: 'Отправлять уведомления об изменении статуса'
      },
      {
        key: 'driverAssignmentNotifications',
        value: 'true',
        type: 'BOOLEAN',
        category: 'notifications',
        description: 'Отправлять уведомления о назначении водителя'
      },
      {
        key: 'customerNotifications',
        value: 'true',
        type: 'BOOLEAN',
        category: 'notifications',
        description: 'Отправлять уведомления клиентам'
      },
      {
        key: 'systemAlerts',
        value: 'true',
        type: 'BOOLEAN',
        category: 'notifications',
        description: 'Отправлять системные уведомления'
      },

      // Общие настройки
      {
        key: 'companyName',
        value: 'STC Transfer',
        type: 'STRING',
        category: 'general',
        description: 'Название компании'
      },
      {
        key: 'supportPhone',
        value: '+998 90 123 45 67',
        type: 'STRING',
        category: 'general',
        description: 'Телефон службы поддержки'
      },
      {
        key: 'supportEmail',
        value: 'support@stctransfer.uz',
        type: 'STRING',
        category: 'general',
        description: 'Email службы поддержки'
      },
      {
        key: 'defaultLanguage',
        value: 'ru',
        type: 'STRING',
        category: 'general',
        description: 'Язык системы по умолчанию'
      },
      {
        key: 'timezone',
        value: 'Asia/Tashkent',
        type: 'STRING',
        category: 'general',
        description: 'Часовой пояс системы'
      },
      {
        key: 'currency',
        value: 'UZS',
        type: 'STRING',
        category: 'general',
        description: 'Валюта системы'
      },
      {
        key: 'workingHours',
        value: JSON.stringify({
          start: '06:00',
          end: '22:00'
        }),
        type: 'JSON',
        category: 'general',
        description: 'Рабочие часы системы'
      },
      {
        key: 'maxAdvanceBookingDays',
        value: '30',
        type: 'NUMBER',
        category: 'general',
        description: 'Максимальное количество дней для предварительного заказа'
      }
    ]

    console.log('🔧 Инициализация настроек по умолчанию...')

    let created = 0
    let updated = 0

    for (const setting of defaultSettings) {
      try {
        const existing = await this.getSettingByKey(setting.key)

        if (existing) {
          // Обновляем только описание, если настройка уже существует
          if (existing.description !== setting.description) {
            await prisma.systemSetting.update({
              where: { key: setting.key },
              data: {
                description: setting.description,
                updated_at: new Date()
              }
            })
            updated++
          }
        } else {
          // Создаем новую настройку
          await this.upsertSetting(setting)
          created++
        }
      } catch (error) {
        console.error(`Error initializing setting ${setting.key}:`, error)
      }
    }

    console.log(`✅ Инициализация завершена: создано ${created}, обновлено ${updated} настроек`)
    return { created, updated }
  }

  // Получить все настройки, сгруппированные по категориям
  static async getSettingsGroupedByCategory() {
    const settings = await this.getAllSettings()

    const grouped: Record<string, any[]> = {}

    settings.forEach(setting => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = []
      }

      let value: any = setting.value

      // Преобразуем значение согласно типу
      switch (setting.type) {
        case 'NUMBER':
          value = parseFloat(setting.value)
          break
        case 'BOOLEAN':
          value = setting.value === 'true'
          break
        case 'JSON':
          try {
            value = JSON.parse(setting.value)
          } catch {
            value = setting.value
          }
          break
      }

      grouped[setting.category].push({
        ...setting,
        parsedValue: value
      })
    })

    return grouped
  }
}
