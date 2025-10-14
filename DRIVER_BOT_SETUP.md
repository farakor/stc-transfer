# 🚗 Настройка Telegram бота для водителей

## 🎯 Зачем нужен отдельный бот?

У вас уже есть:

- 🧑 **Клиентский бот** (@transfer_srs_bot) - для пассажиров, открывает `/language`
- 🚗 **Водительский бот** (нужно создать) - для водителей, открывает `/driver`

Разделение ботов дает:

- ✅ Разные интерфейсы для разных пользователей
- ✅ Разные разрешения и функции
- ✅ Проще управлять и отслеживать
- ✅ Безопаснее - водители не видят клиентский интерфейс

---

## 📱 Шаг 1: Создание водительского бота

### 1. Откройте Telegram и найдите @BotFather

### 2. Создайте нового бота:

```
/newbot
```

### 3. Введите информацию:

**Имя бота (любое):**

```
STC Transfer Driver
```

**Username бота (должен заканчиваться на bot):**

```
stc_transfer_driver_bot
```

или любой другой свободный username, например:

- `stc_driver_bot`
- `transfer_driver_bot`
- `samarkand_driver_bot`

### 4. Сохраните токен

BotFather выдаст токен, например:

```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Сохраните этот токен!** Он понадобится в следующем шаге.

### 5. Настройте описание бота (опционально)

```
/setdescription
```

Выберите своего бота и введите:

```
🚗 Приложение для водителей STC Transfer

Управляйте своими рейсами, получайте новые заказы и обновляйте статус поездок прямо из Telegram!
```

### 6. Настройте кнопку меню

```
/setmenubutton
```

Выберите своего бота:

- **Text:** 🚗 Открыть приложение водителя
- **URL:** https://finer-legal-hedgehog.ngrok-free.app/driver

---

## ⚙️ Шаг 2: Настройка backend

### 1. Обновите `backend/.env`

Найдите раздел с водительским ботом и вставьте ваш токен:

```env
# Водительский бот (для водителей)
TELEGRAM_DRIVER_BOT_TOKEN="ВАШ_ТОКЕН_ВОДИТЕЛЬСКОГО_БОТА"
TELEGRAM_DRIVER_WEBHOOK_URL="https://finer-legal-hedgehog.ngrok-free.app"
TELEGRAM_DRIVER_WEBAPP_URL="https://finer-legal-hedgehog.ngrok-free.app/driver"
```

### 2. Создайте сервис для водительского бота

Я создам файл `backend/src/services/driverTelegramBot.ts` с логикой для водительского бота.

---

## 🔧 Шаг 3: Код для водительского бота

Создадим отдельный сервис для водительского бота:

### backend/src/services/driverTelegramBot.ts

```typescript
import TelegramBot from "node-telegram-bot-api";
import { Request, Response, NextFunction } from "express";

export class DriverTelegramBotService {
  private static instance: DriverTelegramBotService;
  private bot: TelegramBot;
  private token: string;

  private constructor() {
    this.token = process.env.TELEGRAM_DRIVER_BOT_TOKEN!;
    if (!this.token || this.token === "YOUR_DRIVER_BOT_TOKEN_HERE") {
      console.warn("⚠️  TELEGRAM_DRIVER_BOT_TOKEN не настроен");
      return;
    }

    // Initialize bot without polling (we'll use webhooks)
    this.bot = new TelegramBot(this.token, { polling: false });

    this.setupWebhook();
    console.log("🚗 Driver Telegram Bot Service initialized");
  }

  public static getInstance(): DriverTelegramBotService {
    if (!DriverTelegramBotService.instance) {
      DriverTelegramBotService.instance = new DriverTelegramBotService();
    }
    return DriverTelegramBotService.instance;
  }

  private async setupWebhook() {
    try {
      const webhookUrl = `${process.env.TELEGRAM_DRIVER_WEBHOOK_URL}/webhook/driver`;
      await this.bot.setWebHook(webhookUrl);
      console.log(`🔗 Driver webhook set to: ${webhookUrl}`);
    } catch (error) {
      console.error("❌ Failed to set driver webhook:", error);
    }
  }

  public handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const update = req.body;

      if (update.message) {
        this.handleMessage(update.message);
      }

      if (update.callback_query) {
        this.handleCallbackQuery(update.callback_query);
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("❌ Driver webhook error:", error);
      next(error);
    }
  }

  private async handleMessage(message: any) {
    const chatId = message.chat.id;
    const text = message.text;

    if (text === "/start") {
      await this.sendWelcomeMessage(chatId);
    }
  }

  private async handleCallbackQuery(callbackQuery: any) {
    const chatId = callbackQuery.message.chat.id;
    // Handle callback queries here
  }

  private async sendWelcomeMessage(chatId: number) {
    const welcomeText = `
🚗 Добро пожаловать в приложение для водителей STC Transfer!

Здесь вы можете:
✅ Просматривать новые заказы
✅ Управлять текущими рейсами
✅ Обновлять статус поездок
✅ Связываться с клиентами

Нажмите кнопку ниже, чтобы открыть приложение водителя.
    `;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "🚗 Открыть приложение водителя",
            web_app: {
              url:
                process.env.TELEGRAM_DRIVER_WEBAPP_URL ||
                process.env.TELEGRAM_DRIVER_WEBHOOK_URL + "/driver" ||
                "",
            },
          },
        ],
      ],
    };

    try {
      await this.bot.sendMessage(chatId, welcomeText, {
        reply_markup: keyboard,
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error("❌ Failed to send driver welcome message:", error);
    }
  }

  // Отправить уведомление водителю о новом заказе
  public async sendNewOrderNotification(
    driverTelegramId: string,
    booking: any
  ) {
    const message = `
🆕 Новый заказ!

📍 Маршрут: ${booking.from_location} → ${booking.to_location}
👤 Клиент: ${booking.user?.name || booking.user?.first_name || "Не указано"}
📞 Телефон: ${booking.user?.phone || "Не указан"}
💰 Стоимость: ${booking.price} сум
📅 Время подачи: ${
      booking.pickup_time
        ? new Date(booking.pickup_time).toLocaleString("ru-RU")
        : "Как можно скорее"
    }
${booking.notes ? `📝 Примечания: ${booking.notes}` : ""}

⏰ Откройте приложение для подтверждения заказа.
    `;

    try {
      await this.sendMessage(Number(driverTelegramId), message);
    } catch (error) {
      console.error(
        "❌ Failed to send new order notification to driver:",
        error
      );
      throw error;
    }
  }

  // Напоминание водителю о начале рейса
  public async sendTripReminderNotification(
    driverTelegramId: string,
    booking: any
  ) {
    const message = `
⏰ Напоминание о рейсе!

📍 Маршрут: ${booking.from_location} → ${booking.to_location}
👤 Клиент: ${booking.user?.name || booking.user?.first_name}
📞 Телефон: ${booking.user?.phone}
🕐 Время подачи: ${new Date(booking.pickup_time).toLocaleString("ru-RU")}

Не забудьте выехать вовремя!
    `;

    try {
      await this.sendMessage(Number(driverTelegramId), message);
    } catch (error) {
      console.error("❌ Failed to send trip reminder:", error);
    }
  }

  // Уведомление об отмене заказа
  public async sendCancellationNotification(
    driverTelegramId: string,
    bookingId: string,
    reason?: string
  ) {
    const message = `
❌ Заказ отменен

ID заказа: ${bookingId}
${reason ? `Причина: ${reason}` : ""}

Заказ был отменен клиентом или диспетчером.
    `;

    try {
      await this.sendMessage(Number(driverTelegramId), message);
    } catch (error) {
      console.error(
        "❌ Failed to send cancellation notification to driver:",
        error
      );
    }
  }

  // Публичный метод для отправки сообщений
  public async sendMessage(
    chatId: number,
    message: string,
    options?: any
  ): Promise<void> {
    try {
      await this.bot.sendMessage(chatId, message, options);
      console.log(`📤 Сообщение отправлено водителю ${chatId}`);
    } catch (error) {
      console.error("❌ Ошибка отправки сообщения водителю:", error);
      throw error;
    }
  }
}
```

---

## 🔌 Шаг 4: Подключение к backend

### Обновите `backend/src/index.ts`

Добавьте импорт и инициализацию водительского бота:

```typescript
import { DriverTelegramBotService } from "./services/driverTelegramBot";

// ... существующий код ...

// Telegram webhook endpoints
app.use("/webhook", (req, res, next) => {
  // Клиентский бот
  TelegramBotService.getInstance().handleWebhook(req, res, next);
});

app.use("/webhook/driver", (req, res, next) => {
  // Водительский бот
  DriverTelegramBotService.getInstance().handleWebhook(req, res, next);
});

// ... существующий код ...

// Initialize Telegram Bot Services
const telegramBot = TelegramBotService.getInstance();
const driverTelegramBot = DriverTelegramBotService.getInstance();
```

---

## 🧪 Шаг 5: Тестирование

### 1. Перезапустите backend

```bash
cd backend
npm run dev
```

### 2. Убедитесь что ngrok запущен

```bash
ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001
```

### 3. Откройте водительского бота в Telegram

Найдите вашего бота (например: `@stc_transfer_driver_bot`)

### 4. Отправьте `/start`

Должно появиться приветственное сообщение с кнопкой.

### 5. Нажмите "🚗 Открыть приложение водителя"

Должно открыться водительское приложение!

---

## 📊 Архитектура с двумя ботами

```
┌─────────────────────────────────────────┐
│         Telegram Bots                   │
├─────────────────────────────────────────┤
│                                         │
│  🧑 Клиентский бот                      │
│  @transfer_srs_bot                      │
│  → /language (выбор языка, бронирование)│
│                                         │
│  🚗 Водительский бот                    │
│  @stc_transfer_driver_bot               │
│  → /driver (управление рейсами)         │
│                                         │
└─────────────────────────────────────────┘
                   ↓
        ┌──────────────────┐
        │  ngrok (HTTPS)   │
        │  finer-legal-    │
        │  hedgehog        │
        └──────────────────┘
                   ↓
        ┌──────────────────┐
        │  Backend :3001   │
        │  - /webhook      │
        │  - /webhook/driver│
        │  - Proxy         │
        └──────────────────┘
                   ↓
        ┌──────────────────┐
        │  Frontend :3003  │
        │  - /language     │
        │  - /driver       │
        └──────────────────┘
```

---

## 🔐 Безопасность

### Добавьте проверку Telegram ID

В водительском приложении можно добавить проверку:

```typescript
// В компоненте driver
const { user } = useTelegramWebApp();

useEffect(() => {
  // Проверить что этот Telegram ID есть в базе водителей
  const checkDriver = async () => {
    try {
      const response = await fetch(`/api/drivers/telegram/${user?.id}`);
      if (!response.ok) {
        // Этот пользователь не является водителем
        webApp?.showAlert("У вас нет доступа к водительскому приложению");
        webApp?.close();
      }
    } catch (error) {
      console.error("Error checking driver:", error);
    }
  };

  if (user?.id) {
    checkDriver();
  }
}, [user]);
```

---

## 📝 Итоговый checklist

- [ ] Создан новый бот через @BotFather
- [ ] Токен сохранен
- [ ] Обновлен `backend/.env` с токеном водительского бота
- [ ] Создан `backend/src/services/driverTelegramBot.ts`
- [ ] Обновлен `backend/src/index.ts` с webhook для водителя
- [ ] Backend перезапущен
- [ ] ngrok запущен
- [ ] Бот протестирован командой `/start`
- [ ] Web App открывается и работает

---

## 🎉 Готово!

Теперь у вас два бота:

1. **@transfer_srs_bot** (клиенты) → `/language`
2. **@stc_transfer_driver_bot** (водители) → `/driver`

**Каждый видит только свой интерфейс!** ✅

---

## 📚 Дополнительно

- Можно добавить разные команды для водителей (`/stats`, `/today`, `/help`)
- Настроить автоматические уведомления о новых заказах
- Добавить быстрые ответы через inline кнопки
- Интегрировать с системой назначения заказов

---

**Следуйте инструкции и создайте водительского бота! 🚗✨**
