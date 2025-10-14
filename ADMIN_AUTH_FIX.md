# 🔧 Исправление авторизации администратора

## Проблема

❌ Ошибка 404 при попытке входа в админ-панель:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
AdminLogin.tsx:29 Login error: Error: Endpoint not found
```

## Причина

Эндпоинты для авторизации администратора не были созданы. Frontend пытался использовать `/api/auth/login`, который предназначен для клиентов через Telegram.

## Решение

### Backend

#### 1. Создан `AdminAuthController`

**Файл:** `backend/src/controllers/adminAuthController.ts`

Методы:

- `login()` - авторизация администратора
- `getProfile()` - получение профиля
- `changePassword()` - изменение пароля
- `getAllAdmins()` - список администраторов (SUPER_ADMIN)
- `createAdmin()` - создание администратора (SUPER_ADMIN)
- `updateAdmin()` - обновление администратора (SUPER_ADMIN)
- `deleteAdmin()` - удаление администратора (SUPER_ADMIN)

#### 2. Созданы роуты администратора

**Файл:** `backend/src/routes/adminAuth.ts`

Эндпоинты:

- `POST /api/admin/auth/login` - вход (публичный)
- `GET /api/admin/auth/profile` - профиль (защищенный)
- `POST /api/admin/auth/change-password` - смена пароля (защищенный)
- `GET /api/admin/auth/admins` - список администраторов (SUPER_ADMIN)
- `POST /api/admin/auth/admins` - создать администратора (SUPER_ADMIN)
- `PUT /api/admin/auth/admins/:id` - обновить администратора (SUPER_ADMIN)
- `DELETE /api/admin/auth/admins/:id` - удалить администратора (SUPER_ADMIN)

#### 3. Подключены роуты в `index.ts`

```typescript
import adminAuthRoutes from "./routes/adminAuth";
app.use("/api/admin/auth", adminAuthRoutes);
```

#### 4. Установлен bcryptjs

```bash
npm install bcryptjs @types/bcryptjs
```

### Frontend

#### Обновлен `authService.ts`

Все эндпоинты изменены с `/api/auth/*` на `/api/admin/auth/*`:

- `/api/admin/auth/login`
- `/api/admin/auth/profile`
- `/api/admin/auth/change-password`
- `/api/admin/auth/admins`
- и т.д.

## Использование

### 1. Создание администратора

Используйте скрипт для создания первого администратора:

```bash
cd backend
node create-admin.js [email] [password] [firstName] [lastName] [role]
```

Пример:

```bash
node create-admin.js admin@stc.uz admin123 Admin User SUPER_ADMIN
```

По умолчанию (без параметров):

```bash
node create-admin.js
# Email: admin@stc.uz
# Пароль: admin123
# Имя: Admin User
# Роль: SUPER_ADMIN
```

### 2. Вход в админ-панель

1. Откройте браузер: `http://localhost:3001/admin/login`
2. Введите email и пароль
3. Нажмите "Войти"

### 3. Тестирование API

```bash
# Вход
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stc.uz",
    "password": "admin123"
  }'

# Получение профиля
curl http://localhost:3001/api/admin/auth/profile \
  -H "Authorization: Bearer <your-token>"

# Список администраторов (только SUPER_ADMIN)
curl http://localhost:3001/api/admin/auth/admins \
  -H "Authorization: Bearer <your-token>"
```

## Структура ответов

### Успешный вход

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "email": "admin@stc.uz",
      "firstName": "Admin",
      "lastName": "User",
      "role": "SUPER_ADMIN",
      "isActive": true,
      "lastLogin": "2024-10-13T10:00:00.000Z",
      "createdAt": "2024-10-13T09:00:00.000Z"
    }
  }
}
```

### Ошибка

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

## Безопасность

✅ Пароли хешируются с использованием bcryptjs (10 раундов)  
✅ JWT токены с 7-дневным сроком действия  
✅ Проверка активности администратора  
✅ Защита эндпоинтов через middleware  
✅ Разграничение прав доступа по ролям

## Роли администраторов

1. **SUPER_ADMIN** - полный доступ ко всему
2. **ADMIN** - управление заказами, водителями, автомобилями
3. **MANAGER** - просмотр и базовое управление заказами
4. **OPERATOR** - только просмотр данных

## Что было исправлено

✅ Созданы эндпоинты авторизации администратора  
✅ Добавлен AdminAuthController  
✅ Созданы роуты /api/admin/auth/\*  
✅ Обновлен frontend authService  
✅ Установлен bcryptjs  
✅ Добавлен скрипт создания администратора

## Что дальше

1. Запустите backend: `cd backend && npm run dev`
2. Запустите frontend: `cd frontend && npm run dev`
3. Создайте администратора: `cd backend && node create-admin.js`
4. Войдите в админ-панель: `http://localhost:3001/admin/login`

---

**Готово!** 🎉 Авторизация администратора теперь работает корректно.
