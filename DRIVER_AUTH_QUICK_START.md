# Быстрый старт: Авторизация водителей через Telegram

## Что реализовано

✅ **Backend:**

- Обработка контакта в боте водителей (`driverTelegramBot.ts`)
- Методы авторизации в `AuthService`
- API эндпоинт `/api/auth/driver/telegram`
- Генерация и верификация JWT токенов для водителей

✅ **Frontend:**

- Страница авторизации `/driver/auth` (`DriverTelegramAuth.tsx`)
- Обновлен `DriverDashboard` для проверки токена
- Добавлены маршруты в `AppRoutes.tsx`

## Как это работает

### Шаг 1: Водитель в боте

1. Открывает бот водителей в Telegram
2. Отправляет `/start`
3. Получает запрос поделиться номером телефона
4. Нажимает "📱 Поделиться номером"

### Шаг 2: Система проверяет

1. Бот получает номер телефона
2. Ищет водителя в базе данных
3. Если найден - сохраняет `telegram_id`
4. Отправляет подтверждение и кнопку webapp

### Шаг 3: Вход в приложение

1. Водитель нажимает "🚗 Открыть приложение водителя"
2. Открывается страница `/driver/auth`
3. Происходит автоматическая авторизация
4. Создается JWT токен (30 дней)
5. Перенаправление на `/driver/dashboard`

## Быстрый тест

### 1. Проверьте переменные окружения

```bash
# backend/.env
TELEGRAM_DRIVER_BOT_TOKEN=your_token
TELEGRAM_DRIVER_WEBHOOK_URL=https://yourdomain.com
JWT_SECRET=your_secret
```

### 2. Проверьте базу данных

```sql
-- Убедитесь, что у водителей есть поле telegram_id
SELECT id, name, phone, telegram_id FROM drivers LIMIT 5;
```

### 3. Протестируйте бота

```
1. Откройте бот водителей
2. Отправьте: /start
3. Нажмите кнопку "Поделиться номером"
4. Нажмите "Открыть приложение водителя"
```

### 4. Проверьте консоль

В консоли браузера должны появиться логи:

```
🔐 Авторизация водителя через Telegram...
✅ Авторизация успешна
👤 Водитель: {...}
```

## Основные файлы

### Backend:

- `backend/src/services/driverTelegramBot.ts` - обработка контакта
- `backend/src/services/authService.ts` - методы авторизации
- `backend/src/controllers/authController.ts` - контроллер
- `backend/src/routes/auth.ts` - роуты

### Frontend:

- `frontend/src/pages/driver/DriverTelegramAuth.tsx` - страница авторизации
- `frontend/src/pages/driver/DriverDashboard.tsx` - дашборд (обновлен)
- `frontend/src/components/AppRoutes.tsx` - роуты (обновлены)

## Данные в localStorage

После успешной авторизации:

```javascript
localStorage.getItem("driver"); // JSON с данными водителя
localStorage.getItem("driverAuthToken"); // JWT токен
```

## API эндпоинт

```
POST /api/auth/driver/telegram

Body:
{
  initData: "query_id=xxx&user=%7B...%7D&hash=xxx",
  userData: {
    id: 123456789,
    first_name: "Иван",
    last_name: "Иванов",
    username: "ivan"
  }
}

Response:
{
  "success": true,
  "data": {
    "driver": {
      "id": 1,
      "name": "Иван Иванов",
      "phone": "+998901234567",
      "telegramId": "123456789",
      "license": "AB1234567",
      "status": "ACTIVE",
      "vehicle": { ... },
      "activeBookings": [ ... ]
    },
    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Команды бота

- `/start` - Начало работы / авторизация
- `/help` - Справка
- `/status` - Статус водителя

## Возможные ошибки

### "Водитель не найден"

**Решение:** Добавьте водителя в админ-панели с корректным номером телефона

### "Invalid Telegram Web App data"

**Решение:** Проверьте `TELEGRAM_DRIVER_BOT_TOKEN` в `.env`

### "Это приложение работает только в Telegram"

**Решение:** Откройте webapp через бота Telegram

## Безопасность

- ✅ JWT токены с 30-дневным сроком действия
- ✅ Верификация данных через HMAC-SHA256
- ✅ Проверка, что водитель делится СВОИМ номером
- ✅ Токены хранятся только на клиенте

## Следующие шаги

1. ✅ Протестируйте авторизацию с реальным водителем
2. ✅ Убедитесь, что уведомления приходят корректно
3. ✅ Проверьте работу дашборда после авторизации
4. ⚠️ При необходимости можно удалить старую страницу `/driver/login`

## Документация

Полная документация: `DRIVER_TELEGRAM_AUTH_GUIDE.md`

---

**Статус:** ✅ Готово к использованию
**Дата:** 14 октября 2025
