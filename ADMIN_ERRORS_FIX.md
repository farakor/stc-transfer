# 🔧 Исправление ошибок админ-панели

## Исправленные проблемы

### 1. ✅ Дублирование `/api` в URL

**Проблема:** URL формировались как `/api/api/bookings/stats` вместо `/api/bookings/stats`

**Файл:** `frontend/src/services/adminService.ts`

**Исправлено:**

- `'/api/bookings/stats'` → `'/bookings/stats'`
- `'/api/bookings/${id}/status'` → `'/bookings/${id}/status'`
- `'/api/bookings/${id}/assign-driver'` → `'/bookings/${id}/assign-driver'`

### 2. ✅ Ошибка 500 при получении профиля

**Проблема:** Несоответствие между JWT payload и middleware

**Файлы:**

- `backend/src/controllers/adminAuthController.ts`

**Что было:**

- В JWT токене использовалось `userId: admin.id`
- В middleware ожидалось `adminId`
- В контроллерах использовалось `(req as any).userId`

**Что исправлено:**

- JWT токен теперь использует `adminId: admin.id`
- Контроллеры используют `(req as any).admin` (как установлено middleware)
- Все методы обновлены для использования `admin.id` вместо `userId`

**Измененные методы:**

- `getProfile()` - использует `req.admin`
- `changePassword()` - использует `req.admin`
- `deleteAdmin()` - использует `req.admin`

### 3. ✅ Улучшена обработка ошибок

Добавлены проверки и логирование:

- Проверка наличия `admin` в request
- Логирование запросов профиля
- Понятные сообщения об ошибках

## Как проверить исправления

### 1. Перезапустите backend

```bash
cd backend
npm run dev
```

### 2. Войдите в админ-панель

URL: `http://localhost:3001/admin/login`

**Учетные данные:**

- Email: `farrukh.oripov@gmail.com` или `admin@stc.uz`
- Пароль: `admin123`

### 3. Проверьте dashboard

После входа dashboard должен загрузиться без ошибок:

- ✅ Статистика заказов отображается
- ✅ Профиль загружается
- ✅ Нет ошибок 404 или 500

## Что теперь работает

✅ Вход в админ-панель  
✅ Получение профиля администратора  
✅ Статистика заказов  
✅ Все API endpoints администратора  
✅ Смена пароля  
✅ Управление администраторами (для SUPER_ADMIN)

## Структура JWT токена администратора

```json
{
  "adminId": 1,
  "email": "admin@stc.uz",
  "role": "SUPER_ADMIN",
  "type": "admin",
  "iat": 1760397438,
  "exp": 1761002238
}
```

## Важные примечания

1. **Middleware `authenticate`** устанавливает `req.admin` с полями:

   - `id` - ID администратора
   - `email` - Email администратора
   - `role` - Роль администратора
   - `firstName` - Имя
   - `lastName` - Фамилия

2. **Все защищенные роуты** используют `req.admin` для доступа к данным администратора

3. **Токены действительны 7 дней** (можно изменить в `adminAuthController.ts`)

## Тестирование

### Вход

```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@stc.uz", "password": "admin123"}'
```

### Профиль

```bash
curl http://localhost:3001/api/admin/auth/profile \
  -H "Authorization: Bearer <ваш-токен>"
```

### Статистика заказов

```bash
curl http://localhost:3001/api/bookings/stats?period=day \
  -H "Authorization: Bearer <ваш-токен>"
```

---

**Все ошибки исправлены!** ✨ Админ-панель готова к использованию.
