# 📱 Конфигурация Telegram Bot - Финальная

## ✅ Правильная настройка

### backend/.env

```env
# Backend API webhook (для Telegram уведомлений)
TELEGRAM_WEBHOOK_URL="https://f5f0bdb1dc3f.ngrok-free.app"

# Frontend Web App (для мини-приложения в Telegram)
TELEGRAM_WEBAPP_URL="https://f5f0bdb1dc3f.ngrok-free.app/language"
```

**Важно:** `TELEGRAM_WEBAPP_URL` должен включать `/language` в конце!

---

## 🔄 Как это работает

### 1️⃣ Пользователь открывает бота

```
Telegram → @transfer_srs_bot → /start
```

### 2️⃣ Бот показывает кнопку

```javascript
{
  text: '🚗 Заказать трансфер',
  web_app: {
    url: process.env.TELEGRAM_WEBAPP_URL // "https://xxx.ngrok-free.app/language"
  }
}
```

### 3️⃣ Пользователь нажимает кнопку

```
Открывается Web App → https://f5f0bdb1dc3f.ngrok-free.app/language
```

### 4️⃣ Запрос проходит через систему

```
Telegram Web App
    ↓
https://f5f0bdb1dc3f.ngrok-free.app/language (HTTPS через интернет)
    ↓
ngrok туннель (безопасное соединение)
    ↓
Backend: localhost:3001/language
    ↓
Backend видит запрос к /language (не /api, не /webhook)
    ↓
Backend proxy перенаправляет к Frontend
    ↓
Frontend: localhost:3003/vehicles
    ↓
React приложение отдает страницу выбора языка
    ↓
Пользователь видит приложение! 🎉
```

---

## 📊 Архитектура

```
┌─────────────────────┐
│   Telegram User     │
└──────────┬──────────┘
           │
           ↓ /start
┌─────────────────────┐
│   Telegram Bot      │
│ @transfer_srs_bot   │
└──────────┬──────────┘
           │
           ↓ Нажимает "🚗 Заказать трансфер"
           │
           ↓ Открывает Web App
┌─────────────────────────────────────┐
│ https://xxx.ngrok-free.app/language │ (HTTPS)
└──────────┬──────────────────────────┘
           │
           ↓ Туннель
┌─────────────────────┐
│  ngrok              │
│  (Public Gateway)   │
└──────────┬──────────┘
           │
           ↓ http://localhost:3001/language
┌─────────────────────┐
│  Backend (3001)     │
│  - API Endpoints    │
│  - Telegram Bot     │
│  - Proxy to Frontend│
└──────────┬──────────┘
           │
           ↓ Proxy к http://localhost:3003/vehicles
┌─────────────────────┐
│  Frontend (3003)    │
│  - React App        │
│  - Language Page    │
│  - Booking Flow     │
└─────────────────────┘
```

---

## 🔧 Компоненты системы

### 1. Backend (порт 3001)

- **API эндпоинты:** `/api/*`
- **Webhook:** `/webhook` - принимает уведомления от Telegram
- **Health check:** `/health`
- **Proxy:** все остальное → Frontend

### 2. Frontend (порт 3003)

- **Страницы:**
  - `/language` - выбор языка
  - `/route-selection` - выбор маршрута
  - `/booking-form` - форма бронирования
  - `/booking-confirmation` - подтверждение

### 3. ngrok (порт 3001)

- Создает HTTPS туннель к Backend
- Telegram требует HTTPS для Web Apps
- URL меняется при каждом запуске (бесплатная версия)

### 4. Telegram Bot

- Токен: `8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns`
- Username: `@transfer_srs_bot`
- Webhook: `https://xxx.ngrok-free.app/webhook`
- Web App: `https://xxx.ngrok-free.app/language`

---

## ⚙️ Конфигурация proxy в Backend

### backend/src/index.ts

```typescript
import { createProxyMiddleware } from "http-proxy-middleware";

// Proxy для Frontend (Telegram Web App)
const frontendProxy = createProxyMiddleware({
  target: "http://localhost:3003",
  changeOrigin: true,
  ws: true, // proxy websockets для HMR
});

// Проксируем все non-API запросы к frontend
app.use("/", (req, res, next) => {
  // Если запрос к API, пропускаем
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/webhook") ||
    req.path === "/health"
  ) {
    return next();
  }
  // Иначе проксируем к frontend
  frontendProxy(req, res, next);
});
```

---

## 🧪 Тестирование

### 1. Проверьте Backend

```bash
curl http://localhost:3001/health
# Ответ: {"status":"OK",...}
```

### 2. Проверьте Frontend

```bash
curl http://localhost:3003/vehicles
# Ответ: HTML страница
```

### 3. Проверьте Proxy

```bash
curl http://localhost:3001/language
# Ответ: HTML страница (через proxy!)
```

### 4. Проверьте через ngrok

Откройте в браузере:

```
https://f5f0bdb1dc3f.ngrok-free.app/language
```

Должна открыться страница выбора языка.

### 5. Проверьте в Telegram

1. Откройте: [@transfer_srs_bot](https://t.me/transfer_srs_bot)
2. Отправьте: `/start`
3. Нажмите: "🚗 Заказать трансфер"
4. Должно открыться приложение!

---

## 🚨 Важные моменты

### 1. ngrok URL меняется

При каждом запуске ngrok генерирует новый URL.

**Решение:** Обновляйте `.env` файл:

```bash
# Получите новый URL из ngrok
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free.app' | head -1)

# Обновите .env
sed -i '' "s|TELEGRAM_WEBHOOK_URL=.*|TELEGRAM_WEBHOOK_URL=\"$NGROK_URL\"|g" backend/.env
sed -i '' "s|TELEGRAM_WEBAPP_URL=.*|TELEGRAM_WEBAPP_URL=\"$NGROK_URL/language\"|g" backend/.env

# Перезапустите backend
cd backend && npm run dev
```

### 2. Оба сервера должны работать

- ✅ Frontend на 3003
- ✅ Backend на 3001
- ✅ ngrok туннель активен

### 3. CORS настройки

В `.env` должны быть все URL:

```env
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3003,https://f5f0bdb1dc3f.ngrok-free.app"
```

### 4. Telegram Web App требует HTTPS

Поэтому используем ngrok (не можем использовать http://localhost напрямую).

---

## 🎯 Checklist перед запуском

- [ ] Frontend запущен на порту 3003
- [ ] Backend запущен на порту 3001
- [ ] ngrok запущен и туннелирует порт 3001
- [ ] В `.env` указан актуальный ngrok URL
- [ ] `TELEGRAM_WEBAPP_URL` включает `/language`
- [ ] Backend перезапущен после изменения `.env`
- [ ] Proxy настроен в `backend/src/index.ts`
- [ ] `http-proxy-middleware` установлен

---

## 📝 Быстрые команды

```bash
# Терминал 1 - Frontend
cd frontend && npm run dev

# Терминал 2 - ngrok
ngrok http 3001

# Терминал 3 - Обновить .env и запустить Backend
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free.app' | head -1)
sed -i '' "s|TELEGRAM_WEBHOOK_URL=.*|TELEGRAM_WEBHOOK_URL=\"$NGROK_URL\"|g" backend/.env
sed -i '' "s|TELEGRAM_WEBAPP_URL=.*|TELEGRAM_WEBAPP_URL=\"$NGROK_URL/language\"|g" backend/.env
cd backend && npm run dev
```

---

## 🎉 Готово!

Теперь вы понимаете полную архитектуру и можете легко настроить Telegram Bot!

**Тестируйте:** https://t.me/transfer_srs_bot

---

## 📚 См. также

- [TELEGRAM_FIX.md](TELEGRAM_FIX.md) - Решение проблемы с ошибкой
- [TELEGRAM_QUICK_START.md](TELEGRAM_QUICK_START.md) - Быстрый старт
- [TELEGRAM_CLIENT_GUIDE.md](TELEGRAM_CLIENT_GUIDE.md) - Полное руководство
- [README.md](README.md) - Главная документация
