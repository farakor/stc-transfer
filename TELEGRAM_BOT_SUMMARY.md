# 📱 Telegram Bot - Краткая справка

## ✅ Текущий статус

**Ваш Telegram Bot уже настроен и готов к работе!**

| Компонент       | Статус             | Информация                                          |
| --------------- | ------------------ | --------------------------------------------------- |
| 🤖 Telegram Bot | ✅ Активен         | [@transfer_srs_bot](https://t.me/transfer_srs_bot)  |
| 🔗 Webhook      | ✅ Установлен      | https://finer-legal-hedgehog.ngrok-free.app/webhook |
| 🖥️ Backend      | ✅ Работает        | http://localhost:3001                               |
| 🌐 ngrok        | ⚠️ Требует запуска | Для публичного доступа                              |

---

## 🚀 Как запустить клиента (3 команды)

### Вариант 1: Автоматический запуск (РЕКОМЕНДУЕТСЯ)

```bash
./start-telegram-bot.sh
```

Этот скрипт сделает все за вас!

### Вариант 2: Ручной запуск

**Терминал 1 - ngrok:**

```bash
ngrok http 3001
```

**Терминал 2 - Backend:**

```bash
cd backend && npm run dev
```

---

## 📲 Использование бота

### 1. Откройте бота в Telegram

**Прямая ссылка:** https://t.me/transfer_srs_bot

Или найдите в поиске: `@transfer_srs_bot`

### 2. Отправьте команду `/start`

Бот ответит приветственным сообщением.

### 3. Нажмите "🚗 Заказать трансфер"

Откроется Web App для создания заказа.

---

## 🔍 Проверка статуса

```bash
./check-bot-status.sh
```

Покажет статус всех компонентов системы.

---

## 🧪 Тестирование

### Web-интерфейс для тестирования

Откройте в браузере:

```
file:///Users/farrukhoripov/Documents/cursor/stc-transfer/test-telegram-bot.html
```

Или просто откройте файл `test-telegram-bot.html` в браузере.

### Тест через curl

```bash
# Проверка backend
curl http://localhost:3001/health

# Проверка webhook (замените TOKEN на ваш токен)
TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"
curl https://api.telegram.org/bot$TOKEN/getWebhookInfo
```

---

## 🔔 Функции бота

### Автоматические уведомления для клиентов

- ✅ **Заказ принят** - подтверждение создания заказа
- 👤 **Водитель назначен** - информация о водителе и автомобиле
- 🚗 **Поездка началась** - уведомление о старте поездки
- 🎯 **Поездка завершена** - завершение и итоговая стоимость
- ❌ **Заказ отменен** - уведомление об отмене

### Пример уведомления

```
🎉 Ваш заказ принят!

📍 Маршрут: Самарканд → Ташкент
🚗 Транспорт: Седан
💰 Стоимость: 350000 сум

Мы свяжемся с вами в ближайшее время.
```

---

## 📁 Созданные файлы

| Файл                       | Описание                              |
| -------------------------- | ------------------------------------- |
| `start-telegram-bot.sh`    | Автоматический запуск всей системы    |
| `check-bot-status.sh`      | Проверка статуса компонентов          |
| `TELEGRAM_QUICK_START.md`  | Быстрый старт (краткая версия)        |
| `TELEGRAM_CLIENT_GUIDE.md` | Полное руководство (детальная версия) |
| `test-telegram-bot.html`   | Web-интерфейс для тестирования        |
| `TELEGRAM_BOT_SUMMARY.md`  | Этот файл (краткая справка)           |

---

## 🔧 Конфигурация

### Файл `.env` (backend/.env)

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"
TELEGRAM_WEBHOOK_URL="https://finer-legal-hedgehog.ngrok-free.app"

# Backend
PORT=3001
NODE_ENV=development
```

**⚠️ ВАЖНО:** При каждом запуске ngrok генерирует новый URL!

Используйте скрипт `start-telegram-bot.sh` - он автоматически обновит URL.

---

## 🐛 Решение проблем

### Проблема: Бот не отвечает

**Решение:**

1. Проверьте статус: `./check-bot-status.sh`
2. Перезапустите: `./start-telegram-bot.sh`

### Проблема: ngrok URL истек

**Решение:**

```bash
# Остановите все процессы (Ctrl+C)
# Запустите снова
./start-telegram-bot.sh
```

### Проблема: Backend не запускается

**Решение:**

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

---

## 📊 API Endpoints (для разработчиков)

### Отправка уведомлений

```javascript
// Отправить тестовое сообщение
POST /api/admin/send-test-notification
Body: { "chatId": 123456789, "message": "Тест" }

// Отправить уведомление о заказе
POST /api/admin/send-booking-notification
Body: {
  "chatId": 123456789,
  "bookingData": {
    "fromLocation": "Самарканд",
    "toLocation": "Ташкент",
    "vehicleType": "Седан",
    "price": 350000
  }
}
```

---

## 📚 Дополнительная документация

- 📖 [TELEGRAM_QUICK_START.md](TELEGRAM_QUICK_START.md) - Быстрый старт
- 📱 [TELEGRAM_CLIENT_GUIDE.md](TELEGRAM_CLIENT_GUIDE.md) - Полное руководство
- 🚗 [README.md](README.md) - Главная документация проекта

---

## 💡 Полезные ссылки

- 🤖 **Telegram Bot:** [@transfer_srs_bot](https://t.me/transfer_srs_bot)
- 🏠 **Админ панель:** http://localhost:3003/admin/dashboard
- 🚗 **Водительское приложение:** http://localhost:3003/driver
- 🔧 **API Backend:** http://localhost:3001
- 🌐 **ngrok Dashboard:** http://localhost:4040

---

## 🎯 Workflow: Полный цикл заказа

```
1. Клиент открывает @transfer_srs_bot в Telegram
   ↓
2. Нажимает /start
   ↓
3. Нажимает "🚗 Заказать трансфер"
   ↓
4. Заполняет форму заказа в Web App
   ↓
5. Подтверждает заказ
   ↓
6. Получает уведомление: "Заказ принят"
   ↓
7. Диспетчер назначает водителя в админ панели
   ↓
8. Клиент получает уведомление: "Водитель назначен"
   ↓
9. Водитель начинает поездку
   ↓
10. Клиент получает уведомление: "Поездка началась"
    ↓
11. Водитель завершает поездку
    ↓
12. Клиент получает уведомление: "Поездка завершена"
```

---

## ✅ Checklist перед запуском

- [ ] PostgreSQL запущен
- [ ] Backend зависимости установлены (`cd backend && npm install`)
- [ ] База данных создана (`npx prisma db push`)
- [ ] .env файл настроен
- [ ] ngrok установлен (`brew install ngrok`)

Если все ✅ - запускайте: `./start-telegram-bot.sh`

---

## 🎉 Готово!

Ваш Telegram Bot **@transfer_srs_bot** полностью настроен и готов к работе!

**Начните прямо сейчас:**

```bash
./start-telegram-bot.sh
```

**Или откройте бота в Telegram:**
https://t.me/transfer_srs_bot

---

**STC Transfer** - Современная транспортная платформа 🚗✨
