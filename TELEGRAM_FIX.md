# 🔧 Исправление ошибки Telegram Web App

## ❌ Проблема

При открытии мини-приложения в Telegram боте появлялась ошибка:

```json
{ "success": false, "error": "Endpoint not found", "message": "Cannot GET /" }
```

## ✅ Решение

Проблема была в том, что Web App пытался открыть backend API вместо frontend приложения.

### Что было исправлено:

1. **Добавлен proxy в backend** - теперь backend проксирует все не-API запросы к frontend
2. **Обновлена конфигурация бота** - Web App URL теперь правильно указывает на frontend
3. **Установлен http-proxy-middleware** - для проксирования запросов

---

## 🚀 Как запустить сейчас

### Шаг 1: Убедитесь, что оба сервера запущены

**Терминал 1 - Frontend:**

```bash
cd frontend
npm run dev
```

Должен запуститься на: http://localhost:3003

**Терминал 2 - Backend:**

```bash
cd backend
npm run dev
```

Должен запуститься на: http://localhost:3001

**Терминал 3 - ngrok:**

```bash
ngrok http 3001
```

### Шаг 2: Обновите .env файл

Откройте `backend/.env` и убедитесь, что:

```env
# Текущий ngrok URL (скопируйте из ngrok терминала)
TELEGRAM_WEBHOOK_URL="https://ваш-ngrok-url.ngrok-free.app"

# URL для Web App (тот же самый!)
TELEGRAM_WEBAPP_URL="https://ваш-ngrok-url.ngrok-free.app"
```

**Важно:** Оба URL должны быть одинаковыми, так как backend теперь проксирует frontend!

### Шаг 3: Перезапустите backend

После обновления `.env`:

```bash
cd backend
# Остановите (Ctrl+C) и запустите снова
npm run dev
```

### Шаг 4: Тестирование

1. Откройте бота: [@transfer_srs_bot](https://t.me/transfer_srs_bot)
2. Отправьте `/start`
3. Нажмите **"🚗 Заказать трансфер"**
4. Должно открыться приложение для выбора языка!

---

## 🔍 Проверка

### Проверьте, что все работает:

**1. Backend отвечает:**

```bash
curl http://localhost:3001/health
```

**2. Frontend работает:**

```bash
curl http://localhost:3003/
```

**3. Proxy работает:**

```bash
# Откройте в браузере ngrok URL
# Должна открыться страница frontend, а не ошибка
```

**4. ngrok активен:**

```bash
curl http://localhost:4040/api/tunnels
```

---

## 📝 Что изменилось в коде

### backend/src/index.ts

Добавлен proxy middleware:

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
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/webhook") ||
    req.path === "/health"
  ) {
    return next();
  }
  frontendProxy(req, res, next);
});
```

### backend/src/services/telegramBot.ts

Обновлен URL для Web App:

```typescript
const keyboard = {
  inline_keyboard: [
    [
      {
        text: "🚗 Заказать трансфер",
        web_app: {
          url:
            process.env.TELEGRAM_WEBAPP_URL ||
            process.env.TELEGRAM_WEBHOOK_URL ||
            "",
        },
      },
    ],
  ],
};
```

### backend/.env

Добавлена новая переменная:

```env
TELEGRAM_WEBAPP_URL="https://ваш-ngrok-url.ngrok-free.app"
```

---

## 🎯 Как это работает теперь

```
Telegram Bot
    ↓
[Пользователь нажимает "Заказать трансфер"]
    ↓
Открывается: https://ваш-ngrok-url.ngrok-free.app/language
    ↓
ngrok туннель → Backend (3001)
    ↓
Backend видит запрос НЕ к /api
    ↓
Backend проксирует → Frontend (3003)
    ↓
Frontend отдает страницу выбора языка
    ↓
Пользователь видит приложение! ✅
```

---

## 🔧 Альтернативный способ (без proxy)

Если не хотите использовать proxy, можете запустить 2 ngrok туннеля:

### Вариант с платным ngrok:

```bash
# Терминал 1
ngrok http 3001 --subdomain=your-backend

# Терминал 2
ngrok http 3003 --subdomain=your-frontend
```

Тогда в `.env`:

```env
TELEGRAM_WEBHOOK_URL="https://your-backend.ngrok.io"
TELEGRAM_WEBAPP_URL="https://your-frontend.ngrok.io/language"
```

---

## 🆘 Если все еще не работает

### 1. Проверьте логи backend

Должны видеть:

```
🚀 Server running on port 3001
📱 Telegram Bot initialized
🔗 Webhook URL: https://ваш-ngrok-url.ngrok-free.app
```

### 2. Проверьте, что frontend запущен

```bash
lsof -i :3003
```

Должен показать процесс на порту 3003.

### 3. Проверьте ngrok dashboard

Откройте: http://localhost:4040

Посмотрите запросы - должны видеть запросы от Telegram.

### 4. Проверьте webhook

```bash
TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"
curl https://api.telegram.org/bot$TOKEN/getWebhookInfo
```

URL должен совпадать с ngrok URL.

### 5. Перезапустите все

```bash
# Остановите все (Ctrl+C в каждом терминале)
# Затем запустите в порядке:

# 1. Frontend
cd frontend && npm run dev

# 2. ngrok (в новом терминале)
ngrok http 3001

# 3. Обновите backend/.env с новым ngrok URL

# 4. Backend
cd backend && npm run dev
```

---

## 🎉 Готово!

Теперь ваш Telegram Bot должен корректно открывать Web App!

**Тестируйте:** https://t.me/transfer_srs_bot

---

## 📚 См. также

- [TELEGRAM_QUICK_START.md](TELEGRAM_QUICK_START.md) - Быстрый старт
- [TELEGRAM_CLIENT_GUIDE.md](TELEGRAM_CLIENT_GUIDE.md) - Полное руководство
- [README.md](README.md) - Главная документация
