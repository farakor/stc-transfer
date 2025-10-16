import TelegramBot from 'node-telegram-bot-api'
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { getBotMessage, Language } from '../locales/botMessages'

const prisma = new PrismaClient()

export class TelegramBotService {
  private static instance: TelegramBotService
  private bot: TelegramBot
  private token: string

  private constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN!
    if (!this.token) {
      throw new Error('TELEGRAM_BOT_TOKEN is required')
    }

    // Initialize bot without polling (we'll use webhooks)
    this.bot = new TelegramBot(this.token, { polling: false })

    this.setupWebhook()
    console.log('🤖 Telegram Bot Service initialized')
  }

  public static getInstance(): TelegramBotService {
    if (!TelegramBotService.instance) {
      TelegramBotService.instance = new TelegramBotService()
    }
    return TelegramBotService.instance
  }

  private async setupWebhook() {
    try {
      const webhookUrl = `${process.env.TELEGRAM_WEBHOOK_URL}/webhook`
      await this.bot.setWebHook(webhookUrl)
      console.log(`🔗 Webhook set to: ${webhookUrl}`)
    } catch (error) {
      console.error('❌ Failed to set webhook:', error)
    }
  }

  public handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const update = req.body

      if (update.message) {
        this.handleMessage(update.message)
      }

      if (update.callback_query) {
        this.handleCallbackQuery(update.callback_query)
      }

      res.status(200).send('OK')
    } catch (error) {
      console.error('❌ Webhook error:', error)
      next(error)
    }
  }

  private async handleMessage(message: any) {
    const chatId = message.chat.id
    const text = message.text
    const telegramId = message.from.id.toString()

    // Обработка получения контакта (номера телефона)
    if (message.contact) {
      await this.handleContactShared(message)
      return
    }

    if (text === '/start') {
      // Проверяем, есть ли пользователь в базе и выбран ли язык
      const user = await this.getOrCreateUser(message.from)
      
      if (user.language_code === 'ru' && !message.text.includes('change_lang')) {
        // Если язык не выбран (по умолчанию ru), показываем выбор языка
        await this.sendLanguageSelection(chatId)
      } else if (!user.phone || !user.is_phone_verified) {
        // Если номер телефона не указан, запрашиваем его
        await this.requestPhoneNumber(chatId, user.language_code as Language)
      } else {
        // Если язык выбран и телефон указан, показываем кнопку запуска приложения
        await this.sendWelcomeMessage(chatId, user.language_code as Language)
      }
    } else if (text === '/language') {
      // Команда для изменения языка
      await this.sendLanguageSelection(chatId)
    }
  }

  private async handleContactShared(message: any) {
    const chatId = message.chat.id
    const contact = message.contact
    const telegramId = message.from.id.toString()

    try {
      // Проверяем, что пользователь поделился своим номером
      if (contact.user_id && contact.user_id.toString() !== telegramId) {
        // Пользователь поделился чужим номером
        await this.bot.sendMessage(
          chatId,
          'Пожалуйста, поделитесь своим номером телефона.\nPlease share your phone number.\nIltimos, telefon raqamingizni ulashing.'
        )
        return
      }

      // Сохраняем номер телефона
      const user = await prisma.user.update({
        where: { telegram_id: telegramId },
        data: {
          phone: contact.phone_number,
          is_phone_verified: true,
        },
      })

      const language = (user.language_code || 'ru') as Language
      const messages = getBotMessage(language)

      // Отправляем подтверждение
      await this.bot.sendMessage(chatId, messages.phoneVerified, {
        reply_markup: {
          remove_keyboard: true,
        },
      })

      // Показываем welcome сообщение с кнопкой запуска приложения
      await this.sendWelcomeMessage(chatId, language)
    } catch (error) {
      console.error('❌ Error handling contact:', error)
      await this.bot.sendMessage(
        chatId,
        'Произошла ошибка. Попробуйте еще раз.\nAn error occurred. Please try again.\nXatolik yuz berdi. Qayta urinib ko\'ring.'
      )
    }
  }

  private async requestPhoneNumber(chatId: number, language: Language = 'ru') {
    const messages = getBotMessage(language)

    const keyboard = {
      keyboard: [
        [
          {
            text: messages.sharePhone,
            request_contact: true,
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    }

    try {
      await this.bot.sendMessage(chatId, messages.phoneRequest, {
        reply_markup: keyboard,
      })
    } catch (error) {
      console.error('❌ Failed to request phone number:', error)
    }
  }

  private async handleCallbackQuery(callbackQuery: any) {
    const chatId = callbackQuery.message.chat.id
    const data = callbackQuery.data
    const telegramId = callbackQuery.from.id.toString()

    // Обработка выбора языка
    if (data?.startsWith('lang_')) {
      const language = data.split('_')[1] as Language
      const user = await this.updateUserLanguage(telegramId, language)
      
      // Отправляем подтверждение
      await this.bot.answerCallbackQuery(callbackQuery.id, {
        text: '✅',
      })
      
      // Удаляем старое сообщение
      try {
        await this.bot.deleteMessage(chatId, callbackQuery.message.message_id)
      } catch (e) {
        // Игнорируем ошибки удаления
      }
      
      // Проверяем, есть ли номер телефона
      if (!user.phone || !user.is_phone_verified) {
        // Запрашиваем номер телефона
        await this.requestPhoneNumber(chatId, language)
      } else {
        // Показываем welcome сообщение с кнопкой запуска приложения
        await this.sendWelcomeMessage(chatId, language)
      }
    } else if (data === 'change_language') {
      // Показываем выбор языка
      await this.bot.answerCallbackQuery(callbackQuery.id)
      await this.sendLanguageSelection(chatId)
    }
  }

  private async getUserPhotoUrl(userId: number): Promise<string | null> {
    try {
      const photos = await this.bot.getUserProfilePhotos(userId, { limit: 1 })
      
      if (photos.total_count > 0 && photos.photos.length > 0) {
        const photo = photos.photos[0]
        // Берем фото наибольшего размера
        const largestPhoto = photo[photo.length - 1]
        const file = await this.bot.getFile(largestPhoto.file_id)
        
        // Формируем URL фото
        return `https://api.telegram.org/file/bot${this.token}/${file.file_path}`
      }
    } catch (error) {
      console.error('❌ Error getting user photo:', error)
    }
    
    return null
  }

  private async getOrCreateUser(from: any) {
    const telegramId = from.id.toString()
    
    let user = await prisma.user.findUnique({
      where: { telegram_id: telegramId },
    })

    // Получаем URL фото профиля
    const photoUrl = await this.getUserPhotoUrl(from.id)

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegram_id: telegramId,
          first_name: from.first_name,
          last_name: from.last_name,
          username: from.username,
          language_code: 'ru', // По умолчанию русский, но будет предложен выбор
          photo_url: photoUrl,
        },
      })
    } else if (photoUrl && user.photo_url !== photoUrl) {
      // Обновляем фото, если оно изменилось
      user = await prisma.user.update({
        where: { id: user.id },
        data: { photo_url: photoUrl },
      })
    }

    return user
  }

  private async updateUserLanguage(telegramId: string, language: Language) {
    return await prisma.user.update({
      where: { telegram_id: telegramId },
      data: { language_code: language },
    })
  }

  private async sendLanguageSelection(chatId: number) {
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
        ],
        [
          { text: '🇺🇸 English', callback_data: 'lang_en' },
        ],
        [
          { text: '🇺🇿 O\'zbek', callback_data: 'lang_uz' },
        ],
      ],
    }

    try {
      await this.bot.sendMessage(
        chatId,
        'Пожалуйста, выберите язык:\nPlease select your language:\nIltimos, tilni tanlang:',
        {
          reply_markup: keyboard,
        }
      )
    } catch (error) {
      console.error('❌ Failed to send language selection:', error)
    }
  }

  private async sendWelcomeMessage(chatId: number, language: Language = 'ru') {
    const messages = getBotMessage(language)
    
    const welcomeText = `
${messages.welcome.title}

${messages.welcome.description}

${messages.languageSelected}
    `

    // Формируем URL с параметром языка
    const webAppUrl = process.env.TELEGRAM_WEBAPP_URL || process.env.TELEGRAM_WEBHOOK_URL || ''
    const urlWithLang = `${webAppUrl}?lang=${language}`
    
    console.log('🌐 Sending Web App URL:', urlWithLang)
    console.log('🌐 Language:', language)

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: messages.welcome.openApp,
            web_app: { url: urlWithLang }
          }
        ],
        [
          {
            text: '🌐 Change language / Изменить язык / Tilni o\'zgartirish',
            callback_data: 'change_language'
          }
        ]
      ]
    }

    try {
      await this.bot.sendMessage(chatId, welcomeText, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      })
      console.log('✅ Welcome message sent successfully')
    } catch (error) {
      console.error('❌ Failed to send welcome message:', error)
    }
  }

  public async sendNotification(chatId: number, message: string) {
    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
    } catch (error) {
      console.error('❌ Failed to send notification:', error)
      throw error
    }
  }

  public async sendBookingNotification(chatId: number, bookingData: any) {
    // Получаем язык пользователя
    const userId = bookingData.userId || bookingData.user_id
    if (!userId) {
      console.error('❌ User ID not found in booking data')
      return
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    const language = (user?.language_code || 'ru') as Language
    const messages = getBotMessage(language)

    const message = `
${messages.booking.created}

${messages.booking.route}: ${bookingData.fromLocation} → ${bookingData.toLocation}
${messages.booking.vehicle}: ${bookingData.vehicleType}
${messages.booking.price}: ${bookingData.price} ${language === 'uz' ? 'so\'m' : language === 'en' ? 'sum' : 'сум'}

${messages.booking.contact}
    `

    await this.sendNotification(chatId, message)
  }

  public async sendStatusUpdateNotification(chatId: number, booking: any, status: string) {
    // Получаем язык пользователя
    const userId = booking.user_id || booking.userId
    if (!userId) {
      console.error('❌ User ID not found in booking')
      return
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    const language = (user?.language_code || 'ru') as Language
    const messages = getBotMessage(language)
    const currency = language === 'uz' ? 'so\'m' : language === 'en' ? 'sum' : 'сум'
    
    let message = ''

    switch (status) {
      case 'CONFIRMED':
        message = `
${messages.status.confirmed.title}

${messages.status.confirmed.route}: ${booking.fromLocation || booking.from_location} → ${booking.toLocation || booking.to_location}
${messages.status.confirmed.vehicle}: ${booking.vehicle?.brand} ${booking.vehicle?.model}
${messages.status.confirmed.number}: ${booking.vehicle?.licensePlate || booking.vehicle?.license_plate}
${messages.status.confirmed.driver}: ${booking.driver?.name}
${messages.status.confirmed.phone}: ${booking.driver?.phone}

${messages.status.confirmed.message}
        `
        break

      case 'IN_PROGRESS':
        message = `
${messages.status.inProgress.title}

${messages.status.inProgress.message}
        `
        break

      case 'COMPLETED':
        message = `
${messages.status.completed.title}

${messages.status.completed.thanks}
${messages.status.completed.again}

${messages.status.completed.totalPrice}: ${booking.price} ${currency}
        `
        break

      case 'CANCELLED':
        message = `
${messages.status.cancelled.title}

${messages.status.cancelled.message}
${messages.status.cancelled.question}
        `
        break

      default:
        message = `
📊 ${language === 'en' ? 'Order status changed' : language === 'uz' ? 'Buyurtma holati o\'zgartirildi' : 'Статус заказа изменен'}

${language === 'en' ? 'New status' : language === 'uz' ? 'Yangi holat' : 'Новый статус'}: ${status}
        `
    }

    await this.sendNotification(chatId, message)
  }

  public async sendDispatcherNotification(booking: any) {
    const dispatcherChatId = process.env.DISPATCHER_CHAT_ID
    if (!dispatcherChatId) return

    const message = `
🆕 НОВЫЙ ЗАКАЗ

📍 Маршрут: ${booking.fromLocation} → ${booking.toLocation}
👤 Клиент: ${booking.user.name || 'Не указано'}
📞 Телефон: ${booking.user.phone || 'Не указано'}
🚗 Тип ТС: ${booking.vehicleType}
💰 Стоимость: ${booking.price} сум
🕒 Время: ${booking.pickupTime ? new Date(booking.pickupTime).toLocaleString('ru-RU') : 'Не указано'}

📝 Комментарии: ${booking.notes || 'Нет'}

ID заказа: ${booking.id}
    `

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Принять', callback_data: `accept_${booking.id}` },
          { text: '❌ Отклонить', callback_data: `reject_${booking.id}` }
        ],
        [
          { text: '📋 Подробнее', callback_data: `details_${booking.id}` }
        ]
      ]
    }

    try {
      await this.bot.sendMessage(Number(dispatcherChatId), message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      })
    } catch (error) {
      console.error('❌ Failed to send dispatcher notification:', error)
    }
  }

  // Отправить уведомление о назначении водителя
  public async sendDriverAssignmentNotification(chatId: number, booking: any, driver: any) {
    // Получаем язык пользователя
    const userId = booking.user_id || booking.userId
    if (!userId) {
      console.error('❌ User ID not found in booking')
      return
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    const language = (user?.language_code || 'ru') as Language
    const messages = getBotMessage(language)

    const message = `
${messages.driver.assigned}

${messages.status.confirmed.route}: ${booking.fromLocation || booking.from_location} → ${booking.toLocation || booking.to_location}
${messages.status.confirmed.driver}: ${driver.name}
${messages.status.confirmed.phone}: ${driver.phone}
${messages.status.confirmed.vehicle}: ${booking.vehicle?.brand} ${booking.vehicle?.model}
${messages.status.confirmed.number}: ${booking.vehicle?.licensePlate || booking.vehicle?.license_plate}

${messages.driver.onTheWay}
    `

    try {
      await this.sendNotification(chatId, message)
    } catch (error) {
      console.error('❌ Failed to send driver assignment notification:', error)
      throw error
    }
  }

  // Отправить уведомление водителю о новом заказе
  public async sendDriverNewOrderNotification(driverTelegramId: string, booking: any) {
    const message = `
🚗 Новый заказ назначен!

📍 Маршрут: ${booking.from_location} → ${booking.to_location}
👤 Клиент: ${booking.user?.name || booking.user?.first_name || 'Не указано'}
📞 Телефон: ${booking.user?.phone || 'Не указан'}
💰 Стоимость: ${booking.price} сум
📅 Время подачи: ${booking.pickup_time ? new Date(booking.pickup_time).toLocaleString('ru-RU') : 'Как можно скорее'}
${booking.notes ? `📝 Примечания: ${booking.notes}` : ''}

⏰ Пожалуйста, примите заказ в приложении водителя.
    `

    try {
      await this.sendMessage(Number(driverTelegramId), message)
    } catch (error) {
      console.error('❌ Failed to send driver new order notification:', error)
      throw error
    }
  }

  // Уведомление клиенту о том, что водитель принял заказ
  public async sendDriverAcceptedNotification(chatId: number, booking: any, driver: any) {
    const userId = booking.user_id || booking.userId
    if (!userId) {
      console.error('❌ User ID not found in booking')
      return
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    const language = (user?.language_code || 'ru') as Language
    const messages = getBotMessage(language)

    const formatPhone = (phone: string) => {
      const cleaned = phone.replace(/\D/g, '')
      if (cleaned.length === 12 && cleaned.startsWith('998')) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`
      }
      return phone
    }

    const message = `
✅ <b>Водитель принял ваш заказ!</b>

📍 <b>Маршрут:</b>
   ➤ ${booking.fromLocation || booking.from_location} → ${booking.toLocation || booking.to_location}

🚗 <b>Водитель:</b> ${driver.name}
📞 <b>Телефон:</b> ${formatPhone(driver.phone)}
🚙 <b>Автомобиль:</b> ${booking.vehicle?.brand} ${booking.vehicle?.model}
🔢 <b>Номер:</b> ${booking.vehicle?.licensePlate || booking.vehicle?.license_plate}

⏰ <b>Водитель скоро выедет к вам!</b>
    `.trim()

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
      console.log(`✅ Уведомление о принятии заказа отправлено клиенту ${chatId}`)
    } catch (error) {
      console.error('❌ Failed to send driver accepted notification:', error)
    }
  }

  // Уведомление клиенту о том, что водитель начал рейс
  public async sendTripStartedNotification(chatId: number, booking: any, driver: any) {
    const userId = booking.user_id || booking.userId
    if (!userId) {
      console.error('❌ User ID not found in booking')
      return
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    const language = (user?.language_code || 'ru') as Language
    const messages = getBotMessage(language)

    const message = `
🚀 <b>Рейс начался!</b>

📍 <b>Маршрут:</b>
   ➤ ${booking.fromLocation || booking.from_location} → ${booking.toLocation || booking.to_location}

🚗 <b>Водитель:</b> ${driver.name}
🚙 <b>Автомобиль:</b> ${booking.vehicle?.brand} ${booking.vehicle?.model} (${booking.vehicle?.licensePlate || booking.vehicle?.license_plate})

🎯 <b>Вы в пути!</b> Приятной поездки! 🛣️
    `.trim()

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
      console.log(`✅ Уведомление о начале рейса отправлено клиенту ${chatId}`)
    } catch (error) {
      console.error('❌ Failed to send trip started notification:', error)
    }
  }

  // Уведомление клиенту о том, что поездка завершена
  public async sendTripCompletedNotification(chatId: number, booking: any) {
    const userId = booking.user_id || booking.userId
    if (!userId) {
      console.error('❌ User ID not found in booking')
      return
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    const language = (user?.language_code || 'ru') as Language
    const messages = getBotMessage(language)

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price)
    }

    const message = `
🏁 <b>Поездка завершена!</b>

📍 <b>Маршрут:</b>
   ➤ ${booking.fromLocation || booking.from_location} → ${booking.toLocation || booking.to_location}

💰 <b>Стоимость:</b> ${formatPrice(Number(booking.price || booking.total_price))} сум

✨ <b>Спасибо, что воспользовались нашим сервисом!</b>

🌟 Будем рады видеть вас снова!
    `.trim()

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
      console.log(`✅ Уведомление о завершении поездки отправлено клиенту ${chatId}`)
    } catch (error) {
      console.error('❌ Failed to send trip completed notification:', error)
    }
  }

  // Отправить уведомление об отмене заказа
  public async sendCancellationNotification(chatId: number, bookingId: string, reason?: string) {
    const message = `
❌ Заказ отменен

ID заказа: ${bookingId}
${reason ? `Причина: ${reason}` : ''}

Приносим извинения за неудобства. 
Если у вас есть вопросы, свяжитесь с нами.
    `

    try {
      await this.sendNotification(chatId, message)
    } catch (error) {
      console.error('❌ Failed to send cancellation notification:', error)
      throw error
    }
  }

  // Публичный метод для отправки сообщений
  public async sendMessage(chatId: number, message: string, options?: any): Promise<void> {
    try {
      await this.bot.sendMessage(chatId, message, options)
      console.log(`📤 Сообщение отправлено пользователю ${chatId}`)
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error)
      throw error
    }
  }
}
