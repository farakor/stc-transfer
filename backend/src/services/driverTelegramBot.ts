import TelegramBot from 'node-telegram-bot-api'
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class DriverTelegramBotService {
  private static instance: DriverTelegramBotService
  private bot: TelegramBot | null = null
  private token: string
  private isEnabled: boolean = false

  private constructor() {
    this.token = process.env.TELEGRAM_DRIVER_BOT_TOKEN || ''
    
    if (!this.token || this.token === 'YOUR_DRIVER_BOT_TOKEN_HERE') {
      console.warn('⚠️  TELEGRAM_DRIVER_BOT_TOKEN не настроен - водительский бот отключен')
      this.isEnabled = false
      return
    }

    try {
      // Initialize bot without polling (we'll use webhooks)
      this.bot = new TelegramBot(this.token, { polling: false })
      this.isEnabled = true

      this.setupWebhook()
      console.log('🚗 Driver Telegram Bot Service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize driver bot:', error)
      this.isEnabled = false
    }
  }

  public static getInstance(): DriverTelegramBotService {
    if (!DriverTelegramBotService.instance) {
      DriverTelegramBotService.instance = new DriverTelegramBotService()
    }
    return DriverTelegramBotService.instance
  }

  private async setupWebhook() {
    if (!this.bot || !this.isEnabled) return

    try {
      const webhookUrl = `${process.env.TELEGRAM_DRIVER_WEBHOOK_URL}/webhook/driver`
      await this.bot.setWebHook(webhookUrl)
      console.log(`🔗 Driver webhook set to: ${webhookUrl}`)
    } catch (error) {
      console.error('❌ Failed to set driver webhook:', error)
    }
  }

  public handleWebhook(req: Request, res: Response, next: NextFunction): void {
    if (!this.bot || !this.isEnabled) {
      console.warn('⚠️ Driver bot webhook called but bot is disabled')
      res.status(200).send('Driver bot disabled')
      return
    }

    try {
      const update = req.body
      console.log('📥 Driver bot webhook received:', JSON.stringify(update))

      if (update.message) {
        this.handleMessage(update.message)
      }

      if (update.callback_query) {
        this.handleCallbackQuery(update.callback_query)
      }

      res.status(200).send('OK')
    } catch (error) {
      console.error('❌ Driver webhook error:', error)
      next(error)
    }
  }

  private async handleMessage(message: any) {
    if (!this.bot) return

    const chatId = message.chat.id
    const text = message.text
    const telegramId = message.from.id.toString()

    console.log(`🚗 Driver bot message from ${chatId}: ${text}`)

    // Обработка контакта
    if (message.contact) {
      await this.handleContactShared(message)
      return
    }

    if (text === '/start') {
      console.log('🚀 Sending welcome message to driver...')
      await this.checkDriverAndSendWelcome(chatId, telegramId)
    } else if (text === '/help') {
      await this.sendHelpMessage(chatId)
    } else if (text === '/status') {
      await this.sendStatusMessage(chatId, telegramId)
    }
  }

  private async handleCallbackQuery(callbackQuery: any) {
    // Handle callback queries here
    const chatId = callbackQuery.message.chat.id
    const data = callbackQuery.data

    // Можно добавить обработку кнопок
  }

  private async handleContactShared(message: any) {
    const chatId = message.chat.id
    const contact = message.contact
    const telegramId = message.from.id.toString()

    try {
      // Проверяем, что водитель поделился своим номером
      if (contact.user_id && contact.user_id.toString() !== telegramId) {
        // Водитель поделился чужим номером
        await this.bot!.sendMessage(
          chatId,
          '❌ Пожалуйста, поделитесь своим номером телефона.'
        )
        return
      }

      // Ищем водителя по номеру телефона
      const cleanPhone = contact.phone_number.replace(/\D/g, '')
      const formattedPhone = `+${cleanPhone}`

      console.log('🔍 Поиск водителя по номеру телефона:', {
        original: contact.phone_number,
        clean: cleanPhone,
        formatted: formattedPhone
      })

      // Сначала ищем всех водителей
      const allDrivers = await prisma.driver.findMany({
        select: {
          id: true,
          phone: true,
          name: true
        }
      })

      // Находим водителя, сравнивая только цифры в номерах
      const driver = allDrivers.find(d => {
        if (!d.phone) return false
        const dbPhoneClean = d.phone.replace(/\D/g, '')
        const match = dbPhoneClean === cleanPhone
        console.log(`  Сравнение: ${d.phone} (${dbPhoneClean}) === ${contact.phone_number} (${cleanPhone}): ${match}`)
        return match
      })

      // Если нашли водителя, загружаем полные данные
      const fullDriver = driver ? await prisma.driver.findUnique({
        where: { id: driver.id }
      }) : null

      if (!fullDriver) {
        await this.bot!.sendMessage(
          chatId,
          '❌ Водитель с таким номером телефона не найден в системе.\n\nОбратитесь к администратору для добавления вашего профиля.'
        )
        return
      }

      console.log('✅ Водитель найден:', fullDriver.name)

      // Обновляем telegram_id водителя
      await prisma.driver.update({
        where: { id: fullDriver.id },
        data: {
          telegram_id: telegramId
        }
      })

      // Отправляем подтверждение
      await this.bot!.sendMessage(chatId, 
        '✅ Спасибо! Ваш номер телефона подтвержден.\n\nТеперь вы можете использовать приложение водителя.', {
        reply_markup: {
          remove_keyboard: true,
        },
      })

      // Показываем welcome сообщение с кнопкой запуска приложения
      await this.sendWelcomeMessage(chatId)
    } catch (error) {
      console.error('❌ Error handling driver contact:', error)
      await this.bot!.sendMessage(
        chatId,
        '❌ Произошла ошибка. Попробуйте еще раз.'
      )
    }
  }

  private async checkDriverAndSendWelcome(chatId: number, telegramId: string) {
    try {
      // Проверяем, есть ли водитель с таким telegram_id
      const driver = await prisma.driver.findFirst({
        where: { telegram_id: telegramId }
      })

      if (!driver) {
        // Водитель не авторизован - запрашиваем номер телефона
        await this.requestPhoneNumber(chatId)
        return
      }

      // Водитель уже авторизован - показываем welcome
      await this.sendWelcomeMessage(chatId)
    } catch (error) {
      console.error('❌ Error checking driver:', error)
      await this.sendWelcomeMessage(chatId)
    }
  }

  private async requestPhoneNumber(chatId: number) {
    const keyboard = {
      keyboard: [
        [
          {
            text: '📱 Поделиться номером',
            request_contact: true,
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    }

    try {
      await this.bot!.sendMessage(chatId, 
        '📞 Для доступа к приложению водителя, пожалуйста, поделитесь вашим номером телефона.\n\nЭто необходимо для идентификации вашего профиля в системе.', 
        {
          reply_markup: keyboard,
        }
      )
    } catch (error) {
      console.error('❌ Failed to request phone number:', error)
    }
  }

  private async sendWelcomeMessage(chatId: number) {
    if (!this.bot) return

    const welcomeText = `
🚗 Добро пожаловать в приложение для водителей STC Transfer!

Здесь вы можете:
✅ Просматривать новые заказы
✅ Управлять текущими рейсами
✅ Обновлять статус поездок
✅ Связываться с клиентами

Нажмите кнопку ниже, чтобы открыть приложение водителя.

📋 Доступные команды:
/start - Главное меню
/help - Справка
/status - Ваш статус
    `

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🚗 Открыть приложение водителя',
            web_app: { 
              url: process.env.TELEGRAM_DRIVER_WEBAPP_URL || 
                   process.env.TELEGRAM_DRIVER_WEBHOOK_URL + '/driver' || '' 
            }
          }
        ]
      ]
    }

    try {
      await this.bot.sendMessage(chatId, welcomeText, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      })
    } catch (error) {
      console.error('❌ Failed to send driver welcome message:', error)
    }
  }

  private async sendHelpMessage(chatId: number) {
    if (!this.bot) return

    const helpText = `
ℹ️ Справка - Приложение водителя

📱 Как пользоваться:
1. Откройте приложение водителя
2. Просмотрите активные заказы
3. Нажмите "Начать рейс" для начала поездки
4. Используйте навигацию для построения маршрута
5. Нажмите "Завершить рейс" по окончании

📋 Команды:
/start - Главное меню
/help - Эта справка
/status - Ваш статус

💡 Совет: Держите приложение открытым для получения новых заказов!
    `

    try {
      await this.bot.sendMessage(chatId, helpText, { parse_mode: 'HTML' })
    } catch (error) {
      console.error('❌ Failed to send help message:', error)
    }
  }

  private async sendStatusMessage(chatId: number, telegramId: string) {
    if (!this.bot) return

    try {
      // Получаем данные водителя из базы
      const driver = await prisma.driver.findFirst({
        where: { telegram_id: telegramId },
        include: {
          vehicle: true,
          bookings: {
            where: {
              status: {
                in: ['VEHICLE_ASSIGNED', 'CONFIRMED', 'IN_PROGRESS']
              }
            }
          }
        }
      })

      if (!driver) {
        await this.bot.sendMessage(chatId, 
          '❌ Вы не авторизованы. Используйте /start для входа в систему.'
        )
        return
      }

      const statusText = `
📊 Ваш статус

👤 Имя: ${driver.name}
📞 Телефон: ${driver.phone}
🚗 Транспорт: ${driver.vehicle ? `${driver.vehicle.brand} ${driver.vehicle.model} (${driver.vehicle.license_plate})` : 'Не назначен'}
📋 Активных рейсов: ${driver.bookings.length}

Откройте приложение для подробной информации.
      `

      await this.bot.sendMessage(chatId, statusText, { parse_mode: 'HTML' })
    } catch (error) {
      console.error('❌ Failed to send status message:', error)
      
      const fallbackText = `
📊 Ваш статус

🚗 Статус: Активен
📍 Местоположение: Определяется...
📋 Активных рейсов: 0

Откройте приложение для подробной информации.
      `
      
      await this.bot.sendMessage(chatId, fallbackText, { parse_mode: 'HTML' })
    }
  }

  // Отправить уведомление водителю о новом заказе
  public async sendNewOrderNotification(driverTelegramId: string, booking: any) {
    if (!this.bot || !this.isEnabled) {
      console.warn('⚠️ Driver bot is disabled, skipping notification')
      return
    }

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price)
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatPhone = (phone: string) => {
      // Убираем все нечисловые символы
      const cleaned = phone.replace(/\D/g, '')
      // Форматируем для отображения
      if (cleaned.length === 12 && cleaned.startsWith('998')) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`
      }
      return phone
    }

    const clientPhone = booking.user?.phone || 'Не указан'

    const message = `
🆕 <b>НОВЫЙ ЗАКАЗ №${booking.booking_number || booking.id}</b>

📍 <b>Маршрут:</b>
   ➤ Откуда: ${booking.from_location}
   ➤ Куда: ${booking.to_location}
${booking.pickup_location ? `   📌 Точка подачи: ${booking.pickup_location}` : ''}
${booking.dropoff_location ? `   📌 Точка высадки: ${booking.dropoff_location}` : ''}

👤 <b>Пассажир:</b> ${booking.user?.name || booking.user?.first_name || 'Не указано'}
📞 <b>Телефон:</b> ${formatPhone(clientPhone)}
${booking.passenger_count ? `👥 <b>Количество:</b> ${booking.passenger_count} чел.` : ''}

💰 <b>Стоимость:</b> ${formatPrice(Number(booking.price))} сум
${booking.distance_km ? `📏 <b>Расстояние:</b> ${booking.distance_km} км` : ''}
🕐 <b>Время подачи:</b> ${booking.pickup_time ? formatDate(booking.pickup_time) : 'Как можно скорее'}

${booking.notes ? `📝 <b>Примечания:</b>\n${booking.notes}\n` : ''}
⏰ <b>Откройте приложение для принятия заказа!</b>
    `.trim()

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🚗 Открыть приложение водителя',
            web_app: { 
              url: process.env.TELEGRAM_DRIVER_WEBAPP_URL || 
                   process.env.TELEGRAM_DRIVER_WEBHOOK_URL + '/driver' || '' 
            }
          }
        ]
      ]
    }

    try {
      await this.bot.sendMessage(Number(driverTelegramId), message, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      })
      console.log(`✅ Уведомление о новом заказе отправлено водителю ${driverTelegramId}`)
    } catch (error) {
      console.error('❌ Failed to send new order notification to driver:', error)
      // Не бросаем ошибку, чтобы не прерывать процесс назначения
    }
  }

  // Напоминание водителю о начале рейса
  public async sendTripReminderNotification(driverTelegramId: string, booking: any) {
    if (!this.bot || !this.isEnabled) return

    const message = `
⏰ Напоминание о рейсе!

📍 Маршрут: ${booking.from_location} → ${booking.to_location}
👤 Клиент: ${booking.user?.name || booking.user?.first_name}
📞 Телефон: ${booking.user?.phone}
🕐 Время подачи: ${new Date(booking.pickup_time).toLocaleString('ru-RU')}

Не забудьте выехать вовремя!
    `

    try {
      await this.sendMessage(Number(driverTelegramId), message)
    } catch (error) {
      console.error('❌ Failed to send trip reminder:', error)
    }
  }

  // Уведомление об отмене заказа
  public async sendCancellationNotification(driverTelegramId: string, bookingId: string, reason?: string) {
    if (!this.bot || !this.isEnabled) return

    const message = `
❌ Заказ отменен

ID заказа: ${bookingId}
${reason ? `Причина: ${reason}` : ''}

Заказ был отменен клиентом или диспетчером.
    `

    try {
      await this.sendMessage(Number(driverTelegramId), message)
    } catch (error) {
      console.error('❌ Failed to send cancellation notification to driver:', error)
    }
  }

  // Публичный метод для отправки сообщений
  public async sendMessage(chatId: number, message: string, options?: any): Promise<void> {
    if (!this.bot || !this.isEnabled) {
      throw new Error('Driver bot is not enabled')
    }

    try {
      await this.bot.sendMessage(chatId, message, options)
      console.log(`📤 Сообщение отправлено водителю ${chatId}`)
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения водителю:', error)
      throw error
    }
  }

  public isDriverBotEnabled(): boolean {
    return this.isEnabled
  }
}

