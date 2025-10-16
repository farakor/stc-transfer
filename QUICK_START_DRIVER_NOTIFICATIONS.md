# Быстрый старт - Уведомления для водителей

## 🚀 За 5 минут до запуска

### Шаг 1: Настройте переменные окружения

Добавьте в `backend/.env`:

```env
# Telegram бот для водителей (если еще не добавлено)
TELEGRAM_DRIVER_BOT_TOKEN=your_driver_bot_token_here
TELEGRAM_DRIVER_WEBHOOK_URL=https://yourdomain.com
TELEGRAM_DRIVER_WEBAPP_URL=https://yourdomain.com/driver
```

**Где взять токен:**

1. Напишите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте токен

### Шаг 2: Перезапустите бэкенд

```bash
cd backend
npm run build
npm run dev
```

### Шаг 3: Авторизуйте водителя в боте

1. Откройте бота водителя в Telegram
2. Отправьте `/start`
3. Нажмите кнопку "📱 Поделиться номером"
4. Бот подтвердит авторизацию

### Шаг 4: Проверьте работу

```bash
# Откройте новый терминал
cd backend

# Получите список водителей с telegram_id
node test-driver-notification.js

# Отправьте тестовое уведомление
node test-driver-notification.js <telegram_id>
```

### Шаг 5: Тест через админ панель

1. Войдите в админ панель
2. Создайте новый заказ
3. Назначьте водителя
4. Проверьте Telegram водителя - должно прийти уведомление

## ✅ Готово!

Теперь:

- ✅ Водители получают уведомления в Telegram
- ✅ Приложение обновляется каждые 10 секунд
- ✅ Заказы появляются автоматически

## 🆘 Проблемы?

### Уведомление не пришло

**Проверьте:**

```bash
# 1. Запущен ли бэкенд?
# 2. Настроен ли TELEGRAM_DRIVER_BOT_TOKEN?
# 3. Есть ли telegram_id у водителя?

# Проверить telegram_id
node test-driver-notification.js
```

### Автообновление не работает

**Проверьте:**

- Водитель авторизован через Telegram?
- Открыта консоль браузера (F12) - есть ли ошибки?
- Работает ли endpoint: `GET /api/drivers/:id/active-bookings`

## 📚 Полная документация

- [DRIVER_AUTO_REFRESH.md](DRIVER_AUTO_REFRESH.md) - Автообновление
- [DRIVER_TELEGRAM_NOTIFICATIONS.md](DRIVER_TELEGRAM_NOTIFICATIONS.md) - Уведомления
- [TEST_DRIVER_FEATURES.md](TEST_DRIVER_FEATURES.md) - Тестирование
- [SUMMARY_DRIVER_IMPROVEMENTS.md](SUMMARY_DRIVER_IMPROVEMENTS.md) - Резюме

## 💡 Совет

Рекомендуем всем водителям:

1. Авторизоваться в боте
2. Дать разрешение на уведомления в браузере
3. Держать приложение открытым во время смены

Так они не пропустят ни одного заказа!
