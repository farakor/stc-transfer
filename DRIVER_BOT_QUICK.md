# 🚗 Быстрая настройка водительского бота

## ⚡ Создание бота за 5 минут

### Шаг 1: Создайте бота в Telegram

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте: `/newbot`
3. Введите имя: `STC Transfer Driver`
4. Введите username: `stc_transfer_driver_bot` (или любой свободный)
5. **Скопируйте токен!**

---

### Шаг 2: Добавьте токен в .env

Откройте `backend/.env` и вставьте ваш токен:

```env
# Водительский бот (для водителей)
TELEGRAM_DRIVER_BOT_TOKEN="ВАШ_ТОКЕН_СЮДА"
TELEGRAM_DRIVER_WEBHOOK_URL="https://finer-legal-hedgehog.ngrok-free.app"
TELEGRAM_DRIVER_WEBAPP_URL="https://finer-legal-hedgehog.ngrok-free.app/driver"
```

---

### Шаг 3: Перезапустите backend

```bash
cd backend
npm run dev
```

Вы должны увидеть:

```
🚗 Driver Telegram Bot Service initialized
🔗 Driver webhook set to: https://finer-legal-hedgehog.ngrok-free.app/webhook/driver
```

---

### Шаг 4: Проверьте!

1. Найдите вашего бота в Telegram
2. Отправьте: `/start`
3. Нажмите: **"🚗 Открыть приложение водителя"**
4. Должно открыться водительское приложение! ✅

---

## 📱 Два бота в системе

| Бот             | Для кого  | Открывает   | Username                 |
| --------------- | --------- | ----------- | ------------------------ |
| 🧑 Клиентский   | Пассажиры | `/language` | @transfer_srs_bot        |
| 🚗 Водительский | Водители  | `/driver`   | @stc_transfer_driver_bot |

---

## 🔧 Что было создано

✅ **Файлы:**

- `backend/src/services/driverTelegramBot.ts` - сервис водительского бота
- `backend/.env` - добавлены настройки водительского бота
- `backend/src/index.ts` - подключен webhook `/webhook/driver`

✅ **Функции:**

- Приветственное сообщение с кнопкой
- Команды `/start`, `/help`, `/status`
- Уведомления о новых заказах
- Напоминания о рейсах
- Уведомления об отмене

---

## 📋 Команды бота

```
/start - Главное меню и кнопка открытия приложения
/help - Справка по использованию
/status - Статус водителя
```

---

## 🔔 Уведомления для водителей

Водители будут получать:

### 🆕 Новый заказ

```
🆕 Новый заказ!

📍 Маршрут: Самарканд → Ташкент
👤 Клиент: Алишер
📞 Телефон: +998901234567
💰 Стоимость: 350000 сум
📅 Время подачи: 14:00

⏰ Откройте приложение для подтверждения заказа.
```

### ⏰ Напоминание о рейсе

```
⏰ Напоминание о рейсе!

📍 Маршрут: Самарканд → Ташкент
👤 Клиент: Алишер
📞 Телефон: +998901234567
🕐 Время подачи: 14:00

Не забудьте выехать вовремя!
```

### ❌ Отмена заказа

```
❌ Заказ отменен

ID заказа: 123
Причина: Изменились планы клиента

Заказ был отменен клиентом или диспетчером.
```

---

## 🔐 Безопасность (опционально)

Можно добавить проверку что только зарегистрированные водители могут открыть приложение:

В `frontend/src/pages/DriverApp.tsx`:

```typescript
useEffect(() => {
  const checkDriver = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${API_URL}/api/drivers/telegram/${user.id}`
      );

      if (!response.ok) {
        webApp?.showAlert("У вас нет доступа к водительскому приложению");
        webApp?.close();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  checkDriver();
}, [user]);
```

---

## 🧪 Тестирование

### 1. Убедитесь что все запущено:

```bash
# ngrok
ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001

# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run dev
```

### 2. Откройте бота в Telegram

### 3. Отправьте `/start`

### 4. Нажмите кнопку

Должно открыться водительское приложение!

---

## 🐛 Проблемы?

### "⚠️ TELEGRAM_DRIVER_BOT_TOKEN не настроен"

Добавьте токен в `backend/.env`

### "Driver bot disabled"

Проверьте токен в `.env` - он не должен быть `YOUR_DRIVER_BOT_TOKEN_HERE`

### Webhook не работает

1. Проверьте что ngrok запущен
2. Проверьте URL в `.env`
3. Перезапустите backend

---

## 📚 Полная документация

Смотрите [DRIVER_BOT_SETUP.md](DRIVER_BOT_SETUP.md) для детальной информации.

---

## 🎉 Готово!

Теперь у вас два бота:

- 🧑 **@transfer_srs_bot** - для клиентов
- 🚗 **@stc_transfer_driver_bot** - для водителей

**Каждый открывает свой интерфейс! ✅**

---

**Создайте бота и начните использовать! 🚗✨**
