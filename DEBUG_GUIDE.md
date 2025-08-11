# 🔍 Отладка интеграции админ панели

## Проблема
Заказы создаются в основном приложении, но не отображаются в админ панели.

## Проверка по шагам

### 1. ✅ Проверка backend API
```bash
cd backend
npm run dev
```

Тестируем API:
```bash
node test-api-debug.js
```

**Результат:** ✅ API работает, заказы создаются и получаются

### 2. 🔍 Проверка frontend подключения

#### Способ 1: Отладочная страница
```
http://localhost:3001/debug-admin.html
```

#### Способ 2: Консоль браузера
1. Запустите frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Откройте админ панель:
   ```
   http://localhost:3003/admin/bookings
   ```

3. Откройте DevTools (F12) и проверьте:
   - **Console** - есть ли ошибки?
   - **Network** - отправляются ли запросы к `/api/bookings/active`?
   - **Response** - что возвращает API?

### 3. 🔧 Возможные проблемы и решения

#### Проблема: CORS ошибки
**Симптомы:** В консоли ошибки типа "Access-Control-Allow-Origin"
**Решение:** Проверить настройки CORS в backend

#### Проблема: Неправильный порт
**Симптомы:** Запросы идут не туда
**Решение:** 
- Frontend должен быть на порту 3003 (согласно vite.config.ts)
- Backend должен быть на порту 3001
- Прокси настроен в vite.config.ts: `/api` → `http://localhost:3001`

#### Проблема: База данных
**Симптомы:** API возвращает пустые данные
**Решение:** Проверить Prisma Studio: `npx prisma studio`

### 4. 🚀 Быстрое тестирование

1. **Создать заказ через тестовую страницу:**
   ```
   http://localhost:3001/test-booking-flow.html
   ```

2. **Проверить админ панель:**
   ```
   http://localhost:3003/admin/bookings
   ```

3. **Проверить логи в консоли браузера**

### 5. 📊 Проверка конфигурации

#### Vite конфигурация (frontend/vite.config.ts):
```typescript
server: {
  port: 3003,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

#### API конфигурация (frontend/src/services/api.ts):
```typescript
const API_BASE_URL = '/api'; // Использует прокси
```

### 6. 🔍 Отладочные инструменты

1. **debug-admin.html** - проверка API напрямую
2. **test-api-debug.js** - тестирование backend API
3. **test-booking-flow.html** - полный цикл создания/управления заказами
4. **Консоль браузера** - логи frontend приложения
5. **Prisma Studio** - просмотр данных в БД

### 7. ✅ Контрольный список

- [ ] Backend запущен на порту 3001
- [ ] Frontend запущен на порту 3003  
- [ ] Прокси настроен в vite.config.ts
- [ ] В БД есть заказы (проверить через Prisma Studio)
- [ ] API `/api/bookings/active` возвращает данные
- [ ] Нет CORS ошибок в консоли
- [ ] AdminService делает запросы к правильному URL
- [ ] В консоли браузера нет ошибок

### 8. 🆘 Если ничего не помогает

1. Перезапустить оба сервера
2. Очистить кэш браузера (Ctrl+Shift+R)
3. Проверить через `debug-admin.html` 
4. Создать новый заказ через `test-booking-flow.html`
5. Сразу проверить админ панель

## Текущий статус
✅ Backend API работает корректно
❓ Frontend подключение требует проверки
