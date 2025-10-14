# 🚀 Руководство по запуску - STC Transfer

## ✅ Исправлено! Теперь используется постоянная ссылка

**Постоянный URL:** https://finer-legal-hedgehog.ngrok-free.app

Оба скрипта теперь используют постоянную ссылку и **НЕ меняют** её при запуске!

---

## 📋 Два способа запуска

### Способ 1: Простой скрипт (РЕКОМЕНДУЕТСЯ)

```bash
./start-bot.sh
```

**Что делает:**

- ✅ Проверяет конфигурацию
- ✅ Запускает Frontend (если нужно)
- ✅ Запускает Backend
- ✅ Проверяет ngrok туннель
- ❌ НЕ запускает ngrok автоматически

### Способ 2: Полный скрипт

```bash
./start-telegram-bot.sh
```

**Что делает:**

- ✅ Проверяет конфигурацию
- ✅ Использует постоянную ссылку
- ✅ Запускает Backend
- ✅ Проверяет ngrok туннель
- ❌ НЕ запускает ngrok автоматически

---

## 🎯 Правильный порядок запуска

### Шаг 1: Запустите ngrok (один раз)

```bash
ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001
```

**Оставьте этот терминал открытым!** ngrok должен работать постоянно.

### Шаг 2: Запустите систему

В новом терминале:

```bash
./start-bot.sh
```

или

```bash
./start-telegram-bot.sh
```

**Готово!** 🎉

---

## 📱 Проверка

1. Откройте Telegram
2. Найдите: **@transfer_srs_bot**
3. Отправьте: `/start`
4. Нажмите: **"🚗 Заказать трансфер"**
5. Должно открыться приложение выбора языка!

---

## 🔍 Проверка статуса

```bash
./check-bot-status.sh
```

Покажет:

- ✅ Backend работает или нет
- ✅ Frontend работает или нет
- ✅ ngrok активен или нет
- ✅ Telegram Bot активен или нет

---

## 📊 Архитектура с постоянной ссылкой

```
Telegram Bot
    ↓
[Пользователь нажимает "🚗 Заказать трансфер"]
    ↓
Открывается: https://finer-legal-hedgehog.ngrok-free.app/language
    ↓
ngrok (постоянный туннель)
    ↓
Backend: localhost:3001/language
    ↓
Backend Proxy
    ↓
Frontend: localhost:3003/vehicles
    ↓
React приложение отдает страницу
    ↓
✅ Пользователь видит выбор языка!
```

---

## 🛑 Остановка

```bash
# Остановить все процессы
pkill -f 'node.*(backend|frontend)'

# Остановить ngrok
pkill ngrok
```

Или просто **Ctrl+C** в каждом терминале.

---

## ⚙️ Конфигурация (backend/.env)

```env
# Постоянные URLs - НЕ МЕНЯЮТСЯ!
TELEGRAM_WEBHOOK_URL="https://finer-legal-hedgehog.ngrok-free.app"
TELEGRAM_WEBAPP_URL="https://finer-legal-hedgehog.ngrok-free.app/language"

# Telegram Bot Token
TELEGRAM_BOT_TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3003,https://finer-legal-hedgehog.ngrok-free.app"
```

**Эти настройки НЕ нужно менять вручную!** Скрипты сами проверят и обновят если нужно.

---

## 🐛 Решение проблем

### ❌ "ngrok туннель не доступен"

**Причина:** ngrok не запущен или использует другой порт

**Решение:**

```bash
# Убедитесь что используете ВАШ постоянный домен:
ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001
```

### ❌ "Backend не отвечает"

**Решение:**

```bash
# Перезапустите backend
pkill -f "node.*backend"
cd backend && npm run dev
```

### ❌ "Frontend не загружается"

**Решение:**

```bash
# Перезапустите frontend
pkill -f "node.*frontend"
cd frontend && npm run dev
```

### ❌ "Бот показывает старую ссылку"

**Причина:** Возможно использовали старый скрипт

**Решение:**

1. Проверьте `backend/.env` - должен быть `finer-legal-hedgehog.ngrok-free.app`
2. Если нет - запустите любой скрипт, он обновит автоматически
3. Перезапустите backend

---

## 📝 Ежедневный workflow

```bash
# Утром:
# 1. Запустите ngrok (в отдельном терминале)
ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001

# 2. Запустите систему (в новом терминале)
./start-bot.sh

# Работайте весь день...

# Вечером:
# Просто закройте терминалы (Ctrl+C)
```

---

## ✅ Преимущества

| Было (временная ссылка)    | Стало (постоянная ссылка) |
| -------------------------- | ------------------------- |
| ❌ URL меняется каждый раз | ✅ URL всегда один        |
| ❌ Нужно обновлять .env    | ✅ Настройки не меняются  |
| ❌ Webhook нестабильный    | ✅ Webhook постоянный     |
| ❌ Сложно тестировать      | ✅ Легко тестировать      |

---

## 🔗 Полезные ссылки

- **Telegram Bot:** https://t.me/transfer_srs_bot
- **Публичный URL:** https://finer-legal-hedgehog.ngrok-free.app
- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:3003
- **Админ панель:** http://localhost:3003/admin/dashboard
- **Водительское приложение:** http://localhost:3003/driver

---

## 📚 Документация

- **[QUICK_START.md](QUICK_START.md)** - Быстрый старт
- **[TELEGRAM_CONFIG.md](TELEGRAM_CONFIG.md)** - Конфигурация
- **[TELEGRAM_DEBUG.md](TELEGRAM_DEBUG.md)** - Отладка
- **[TELEGRAM_FIX.md](TELEGRAM_FIX.md)** - Исправление ошибок
- **[README.md](README.md)** - Главная документация

---

## 🎉 Итого

Теперь оба скрипта:

- ✅ Используют постоянную ссылку
- ✅ НЕ запускают ngrok автоматически
- ✅ НЕ меняют URL при запуске
- ✅ Проверяют доступность туннеля
- ✅ Автоматически исправляют .env если нужно

**Просто запустите ngrok один раз и пользуйтесь! 🚗✨**
