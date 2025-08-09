import TelegramBot from 'node-telegram-bot-api'
import { Request, Response, NextFunction } from 'express'

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

    if (text === '/start') {
      await this.sendWelcomeMessage(chatId)
    }
  }

  private async handleCallbackQuery(callbackQuery: any) {
    const chatId = callbackQuery.message.chat.id
    // Handle callback queries here
  }

  private async sendWelcomeMessage(chatId: number) {
    const welcomeText = `
🚗 Добро пожаловать в STC Transfer!

Мы поможем вам заказать комфортный трансфер по Самарканду и в другие города Узбекистана.

Нажмите кнопку ниже, чтобы начать заказ.
    `

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🚗 Заказать трансфер',
            web_app: { url: process.env.TELEGRAM_WEBHOOK_URL || '' }
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
    const message = `
🎉 Ваш заказ принят!

📍 Маршрут: ${bookingData.fromLocation} → ${bookingData.toLocation}
🚗 Транспорт: ${bookingData.vehicleType}
💰 Стоимость: ${bookingData.price} сум

Мы свяжемся с вами в ближайшее время.
    `

    await this.sendNotification(chatId, message)
  }

  public async sendStatusUpdateNotification(chatId: number, booking: any, status: string) {
    let message = ''

    switch (status) {
      case 'CONFIRMED':
        message = `
✅ Ваш заказ подтвержден!

📍 Маршрут: ${booking.fromLocation} → ${booking.toLocation}
🚗 Автомобиль: ${booking.vehicle?.brand} ${booking.vehicle?.model}
🚗 Номер: ${booking.vehicle?.licensePlate}
👤 Водитель: ${booking.driver?.name}
📞 Телефон: ${booking.driver?.phone}

Водитель уже в пути к вам!
        `
        break

      case 'IN_PROGRESS':
        message = `
🚗 Поездка началась!

Водитель ${booking.driver?.name} начал поездку.
Желаем приятного путешествия!
        `
        break

      case 'COMPLETED':
        message = `
🎯 Поездка завершена!

Спасибо за использование наших услуг!
Будем рады видеть вас снова.

💰 Итоговая стоимость: ${booking.price} сум
        `
        break

      case 'CANCELLED':
        message = `
❌ Заказ отменен

Ваш заказ был отменен.
Если у вас есть вопросы, свяжитесь с нами.
        `
        break

      default:
        message = `
📊 Статус заказа изменен

Новый статус: ${status}
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
}
