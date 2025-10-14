# 🔐 Руководство по авторизации клиентов через Telegram

## Обзор

Реализована полноценная система авторизации клиентов через Telegram с использованием номера телефона. Клиенты теперь должны авторизоваться перед использованием приложения.

## Архитектура

### Backend

#### 1. База данных (Prisma Schema)

Добавлены новые поля в модель `User`:

```prisma
model User {
  auth_token        String?   @unique  // JWT токен для авторизации
  is_phone_verified Boolean   @default(false)  // Подтвержден ли номер телефона
}
```

#### 2. Auth Service (`backend/src/services/authService.ts`)

Основные методы:

- `generateAuthToken()` - генерация JWT токена (срок действия 30 дней)
- `verifyTelegramWebAppData()` - верификация данных из Telegram Web App
- `authenticateUser()` - авторизация пользователя
- `updateUserPhone()` - обновление номера телефона
- `getUserByToken()` - получение пользователя по токену
- `logout()` - выход из системы

#### 3. Auth Controller (`backend/src/controllers/authController.ts`)

Эндпоинты:

- `POST /api/auth/telegram` - авторизация через Telegram (публичный)
- `GET /api/auth/me` - получение текущего пользователя (защищенный)
- `PUT /api/auth/phone` - обновление номера телефона (защищенный)
- `POST /api/auth/logout` - выход (защищенный)

#### 4. Middleware (`backend/src/middleware/clientAuth.ts`)

- `clientAuth` - обязательная проверка авторизации
- `optionalClientAuth` - опциональная проверка авторизации

#### 5. Telegram Bot (`backend/src/services/telegramBot.ts`)

Обновленный flow:

1. `/start` → Выбор языка
2. После выбора языка → Запрос номера телефона (кнопка "Поделиться номером")
3. После получения номера → Приветственное сообщение с кнопкой "Заказать трансфер"

Новые методы:

- `handleContactShared()` - обработка получения контакта
- `requestPhoneNumber()` - запрос номера телефона

#### 6. Локализация (`backend/src/locales/botMessages.ts`)

Добавлены сообщения на трех языках (ru, en, uz):

- `phoneRequest` - запрос номера телефона
- `sharePhone` - текст кнопки "Поделиться номером"
- `phoneVerified` - подтверждение получения номера

### Frontend

#### 1. Telegram Auth Service (`frontend/src/services/telegramAuth.ts`)

Класс для работы с Telegram Web App API:

Основные методы:

- `init()` - инициализация Telegram Web App
- `getWebApp()` - получение экземпляра Web App
- `isTelegramWebApp()` - проверка, запущено ли в Telegram
- `getUser()` - получение данных пользователя из Telegram
- `getInitData()` - получение initData для верификации
- `authenticate()` - авторизация на сервере
- `getAuthToken()` - получение сохраненного токена
- `isAuthenticated()` - проверка авторизации
- `logout()` - выход
- `showBackButton()` / `hideBackButton()` - управление кнопкой "Назад"
- `showMainButton()` / `hideMainButton()` - управление главной кнопкой
- `hapticFeedback()` - тактильная обратная связь
- `getColorScheme()` - получение темы (light/dark)

#### 2. Auth Hook (`frontend/src/hooks/useAuth.ts`)

React хук для управления авторизацией:

```typescript
const {
  isAuthenticated, // Авторизован ли пользователь
  isLoading, // Идет ли процесс авторизации
  user, // Данные пользователя
  error, // Ошибка авторизации
  authenticate, // Функция для авторизации
  logout, // Функция для выхода
} = useAuth();
```

#### 3. API Service (`frontend/src/services/api.ts`)

Обновлен interceptor для автоматического добавления токена авторизации в заголовки:

```typescript
Authorization: Bearer<authToken>;
```

#### 4. App Component (`frontend/src/App.tsx`)

Интегрирован хук `useAuth`:

- Автоматическая авторизация при запуске
- Показ экрана загрузки во время авторизации
- Показ ошибки авторизации при необходимости

## Процесс авторизации

### Для нового пользователя

1. **Пользователь открывает бот в Telegram**

   - Нажимает `/start`

2. **Выбор языка**

   - Бот предлагает выбрать язык (ru/en/uz)
   - Пользователь выбирает язык

3. **Запрос номера телефона**

   - Бот запрашивает номер телефона
   - Показывается кнопка "Поделиться номером"
   - Пользователь нажимает кнопку и делится номером

4. **Сохранение номера**

   - Бот сохраняет номер телефона в базе данных
   - Номер помечается как подтвержденный
   - Показывается сообщение о успешной верификации

5. **Открытие приложения**

   - Бот показывает кнопку "Заказать трансфер"
   - Пользователь нажимает кнопку
   - Открывается Web App

6. **Авторизация в приложении**
   - Frontend получает данные из Telegram Web App
   - Отправляет данные на сервер
   - Сервер создает/обновляет пользователя
   - Генерируется JWT токен
   - Токен сохраняется на клиенте
   - Пользователь перенаправляется в приложение

### Для существующего пользователя

1. Пользователь открывает бот
2. Бот сразу показывает кнопку "Заказать трансфер"
3. При открытии Web App происходит автоматическая авторизация по сохраненному токену

## Безопасность

### JWT Токены

- Срок действия: 30 дней
- Хранение: localStorage на клиенте, поле `auth_token` в БД
- Алгоритм: HS256
- Secret: из переменной окружения `JWT_SECRET`

### Верификация данных Telegram

Данные из Telegram Web App верифицируются через HMAC:

1. Извлекается hash из initData
2. Создается строка для проверки из остальных параметров
3. Вычисляется HMAC с использованием секретного ключа
4. Сравнивается с полученным hash

### Защита эндпоинтов

Эндпоинты защищены middleware `clientAuth`:

- Проверяется наличие токена в заголовке Authorization
- Токен верифицируется через JWT
- Проверяется наличие пользователя в БД
- Данные пользователя добавляются в req.user

## API Эндпоинты

### Публичные

#### POST /api/auth/telegram

Авторизация через Telegram Web App

**Request:**

```json
{
  "initData": "query_id=...",
  "userData": {
    "id": 12345,
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "language_code": "en"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "authToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "telegramId": "12345",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "phone": "+998901234567",
      "languageCode": "en",
      "isPhoneVerified": true
    }
  }
}
```

### Защищенные (требуют токен)

#### GET /api/auth/me

Получение информации о текущем пользователе

**Headers:**

```
Authorization: Bearer <authToken>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "telegramId": "12345",
    "firstName": "John",
    "phone": "+998901234567",
    "languageCode": "en",
    "isPhoneVerified": true
  }
}
```

#### PUT /api/auth/phone

Обновление номера телефона

**Headers:**

```
Authorization: Bearer <authToken>
```

**Request:**

```json
{
  "phone": "+998901234567"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "phone": "+998901234567",
    "isPhoneVerified": true
  }
}
```

#### POST /api/auth/logout

Выход из системы

**Headers:**

```
Authorization: Bearer <authToken>
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Использование в коде

### Backend - Защита эндпоинта

```typescript
import { clientAuth } from '@/middleware/clientAuth'

// Защищенный эндпоинт
router.post('/bookings', clientAuth, BookingController.createBooking)

// В контроллере
static async createBooking(req: Request, res: Response) {
  const userId = (req as any).userId  // ID пользователя из middleware
  const user = (req as any).user      // Данные пользователя

  // Создание бронирования
  const booking = await BookingService.create({
    userId,
    ...req.body
  })

  res.json({ success: true, data: booking })
}
```

### Frontend - Использование авторизации

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Необходима авторизация</div>;
  }

  return (
    <div>
      <p>Привет, {user?.firstName}!</p>
      <p>Телефон: {user?.phone}</p>
      <button onClick={logout}>Выйти</button>
    </div>
  );
}
```

### Frontend - Использование Telegram Web App API

```typescript
import TelegramAuthService from "@/services/telegramAuth";

// Показать кнопку "Назад"
TelegramAuthService.showBackButton(() => {
  navigate(-1);
});

// Показать главную кнопку
TelegramAuthService.showMainButton("Продолжить", () => {
  handleSubmit();
});

// Haptic feedback
TelegramAuthService.hapticFeedback("success");

// Получить тему
const colorScheme = TelegramAuthService.getColorScheme();
```

## Режим разработки

### Backend

Авторизация работает с реальными данными из Telegram Web App или с предоставленными данными для тестирования.

### Frontend

Если приложение открыто не в Telegram:

- Используются mock данные для пользователя
- Авторизация симулируется локально
- Все функции работают в режиме заглушек

Mock пользователь:

```typescript
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

### Backend (.env)

```env
# JWT Secret для подписи токенов
JWT_SECRET="your-super-secret-jwt-key-here"

# Telegram Bot Token (для верификации данных)
TELEGRAM_BOT_TOKEN="your-bot-token"
```

## Миграция базы данных

Миграция создана и применена:

- `20251013000000_add_user_auth_fields`

Изменения:

- Добавлено поле `auth_token` (TEXT, UNIQUE)
- Добавлено поле `is_phone_verified` (BOOLEAN, DEFAULT false)

## Тестирование

### 1. Проверка flow в боте

```bash
# Запустить бот
npm run start:bot

# В Telegram:
# 1. /start
# 2. Выбрать язык
# 3. Поделиться номером
# 4. Открыть приложение
```

### 2. Проверка авторизации в приложении

```bash
# Запустить backend
cd backend && npm run dev

# Запустить frontend
cd frontend && npm run dev

# Открыть в браузере (для development режима)
# Открыть через Telegram Web App (для production режима)
```

### 3. Проверка API эндпоинтов

```bash
# Авторизация
curl -X POST http://localhost:3001/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "userData": {
      "id": 12345,
      "first_name": "Test",
      "language_code": "ru"
    }
  }'

# Получение текущего пользователя
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <token>"

# Выход
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

## Возможные проблемы и решения

### 1. Ошибка "Invalid token"

**Причина:** Токен истек или неверный

**Решение:**

- Повторная авторизация
- Проверить JWT_SECRET на сервере
- Очистить localStorage на клиенте

### 2. Бот не запрашивает номер телефона

**Причина:** Номер уже сохранен в БД

**Решение:**

- Удалить номер из БД для тестирования
- Или создать нового пользователя

### 3. Frontend не может авторизоваться

**Причина:** Нет данных Telegram Web App

**Решение:**

- Открыть приложение через Telegram
- Или использовать mock данные в режиме разработки

### 4. CORS ошибки

**Причина:** Неправильная настройка CORS

**Решение:**

- Проверить ALLOWED_ORIGINS в .env
- Убедиться, что ngrok URL добавлен

## Дальнейшие улучшения

1. **Двухфакторная аутентификация**

   - SMS код для подтверждения
   - Email подтверждение

2. **Обновление токенов**

   - Refresh tokens
   - Автоматическое обновление при истечении

3. **Аудит авторизации**

   - Логирование входов
   - История сессий
   - Управление активными сессиями

4. **Социальная авторизация**

   - Google
   - Facebook
   - Apple

5. **Биометрия**
   - Face ID
   - Touch ID
   - Отпечаток пальца

## Заключение

Система авторизации полностью интегрирована и готова к использованию. Клиенты должны авторизоваться через Telegram и подтвердить номер телефона перед использованием приложения.

Все данные надежно защищены с использованием JWT токенов и верификации данных Telegram Web App.
