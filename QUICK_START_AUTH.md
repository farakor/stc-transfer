# 🚀 Быстрый старт: Авторизация клиентов

## Что реализовано

✅ Авторизация клиентов через Telegram с номером телефона  
✅ JWT токены для безопасного доступа к API  
✅ Автоматическая авторизация при повторном входе  
✅ Защита эндпоинтов через middleware  
✅ Поддержка трех языков (ru, en, uz)

## Как это работает

### 1. Пользователь впервые открывает бот

```
1. /start → Выбор языка (ru/en/uz)
2. После выбора → Запрос номера телефона
3. Кнопка "Поделиться номером" → Telegram отправляет контакт
4. Бот сохраняет номер → Показывает кнопку "Заказать трансфер"
5. Пользователь нажимает → Открывается Web App
6. Web App авторизует пользователя → Сохраняет токен
7. Пользователь работает в приложении
```

### 2. Пользователь открывает бот повторно

```
1. /start → Бот сразу показывает "Заказать трансфер"
2. Открывается Web App → Автоматическая авторизация по токену
3. Пользователь работает в приложении
```

## Структура файлов

### Backend

```
backend/
├── prisma/schema.prisma                    # Добавлены поля auth_token, is_phone_verified
├── prisma/migrations/20251013000000_*/     # Миграция для auth полей
├── src/
│   ├── services/
│   │   ├── authService.ts                  # Логика авторизации
│   │   └── telegramBot.ts                  # Обновлен для запроса телефона
│   ├── controllers/
│   │   └── authController.ts               # API эндпоинты авторизации
│   ├── middleware/
│   │   └── clientAuth.ts                   # Проверка токена
│   ├── routes/
│   │   └── auth.ts                         # Роуты авторизации
│   └── locales/
│       └── botMessages.ts                  # Добавлены сообщения для телефона
```

### Frontend

```
frontend/
├── src/
│   ├── services/
│   │   ├── telegramAuth.ts                 # Telegram Web App API
│   │   └── api.ts                          # Обновлен для токенов
│   ├── hooks/
│   │   └── useAuth.ts                      # React хук авторизации
│   └── App.tsx                             # Интегрирована авторизация
```

## API Эндпоинты

### Публичные

- `POST /api/auth/telegram` - авторизация через Telegram

### Защищенные (требуют токен)

- `GET /api/auth/me` - данные текущего пользователя
- `PUT /api/auth/phone` - обновление телефона
- `POST /api/auth/logout` - выход

## Использование в коде

### Backend: Защита эндпоинта

```typescript
import { clientAuth } from "@/middleware/clientAuth";

// Защищенный роут
router.post("/bookings", clientAuth, BookingController.create);

// В контроллере
const userId = (req as any).userId;
const user = (req as any).user;
```

### Frontend: Использование авторизации

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div>
      {isAuthenticated && (
        <p>
          Привет, {user?.firstName}! Тел: {user?.phone}
        </p>
      )}
    </div>
  );
}
```

### Frontend: Telegram Web App API

```typescript
import TelegramAuthService from "@/services/telegramAuth";

// Показать кнопку назад
TelegramAuthService.showBackButton(() => navigate(-1));

// Haptic feedback
TelegramAuthService.hapticFeedback("success");

// Получить тему
const theme = TelegramAuthService.getColorScheme();
```

## Запуск

### 1. Применить миграцию

```bash
cd backend
# Миграция уже применена автоматически
# Если нужно применить вручную:
psql -U farrukhoripov -d stc_transfer -f prisma/migrations/20251013000000_add_user_auth_fields/migration.sql
```

### 2. Запустить backend

```bash
cd backend
npm run dev
```

### 3. Запустить frontend

```bash
cd frontend
npm run dev
```

### 4. Протестировать в Telegram

1. Открыть бот в Telegram
2. Отправить `/start`
3. Выбрать язык
4. Поделиться номером телефона
5. Нажать "Заказать трансфер"
6. Приложение откроется и авторизует пользователя

## Тестирование без Telegram

Frontend работает в режиме разработки с mock данными:

```typescript
// Автоматически используется mock пользователь:
{
  id: 1,
  telegramId: '12345',
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser',
  phone: '+998901234567',
  languageCode: 'ru',
  isPhoneVerified: true
}
```

## Переменные окружения

Убедитесь, что в `backend/.env` есть:

```env
JWT_SECRET="your-super-secret-jwt-key-here"
TELEGRAM_BOT_TOKEN="your-bot-token"
```

## Безопасность

- ✅ JWT токены (срок: 30 дней)
- ✅ Верификация данных Telegram через HMAC
- ✅ Токен хранится в localStorage (клиент) и БД (сервер)
- ✅ Middleware проверяет токен на каждом запросе
- ✅ Номер телефона подтверждается через Telegram

## Важно

1. **Токены истекают через 30 дней** - пользователь должен будет авторизоваться заново
2. **Номер телефона обязателен** - без него нельзя открыть приложение
3. **Данные верифицируются** - данные из Telegram проверяются на сервере
4. **Поддержка offline** - если есть токен, приложение работает

## Полная документация

Подробная документация: [TELEGRAM_AUTH_GUIDE.md](./TELEGRAM_AUTH_GUIDE.md)

## Поддержка

Если возникли проблемы:

1. Проверьте логи backend (`console.log`)
2. Проверьте логи frontend (браузер console)
3. Убедитесь, что миграция применена
4. Проверьте JWT_SECRET в .env
5. Очистите localStorage в браузере

---

**Готово!** 🎉 Система авторизации полностью работает.
