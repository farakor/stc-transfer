# ⚡ Быстрый запуск Telegram Bot - STC Transfer

## 🎯 У вас есть постоянная ngrok ссылка!

**URL:** https://finer-legal-hedgehog.ngrok-free.app

Это значительно упрощает настройку! 🎉

---

## 🚀 Запуск в 1 команду

```bash
./start-bot.sh
```

Скрипт автоматически:

- ✅ Проверит конфигурацию
- ✅ Запустит Frontend (если не запущен)
- ✅ Запустит/Перезапустит Backend
- ✅ Проверит ngrok туннель
- ✅ Покажет информацию о боте

---

## 📋 Перед первым запуском

### 1. Убедитесь что ngrok запущен:

```bash
ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001
```

### 2. Запустите скрипт:

```bash
./start-bot.sh
```

Все! Готово! 🎉

---

## 📱 Использование бота

После запуска:

1. Откройте Telegram
2. Найдите бота: **@transfer_srs_bot**
3. Отправьте: `/start`
4. Нажмите: **"🚗 Заказать трансфер"**
5. Выберите язык и начните бронирование!

---

## 🔍 Проверка статуса

```bash
./check-bot-status.sh
```

Покажет статус всех компонентов.

---

## 📊 Компоненты системы

| Компонент   | Порт/URL                                    | Статус          |
| ----------- | ------------------------------------------- | --------------- |
| 🖥️ Backend  | http://localhost:3001                       | Автозапуск      |
| 🌐 Frontend | http://localhost:3003                       | Автозапуск      |
| 🌍 ngrok    | https://finer-legal-hedgehog.ngrok-free.app | Нужно запустить |
| 🤖 Bot      | @transfer_srs_bot                           | Готов           |

---

## 🛠️ Ручной запуск (если нужно)

### Терминал 1 - ngrok:

```bash
ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001
```

### Терминал 2 - Frontend:

```bash
cd frontend && npm run dev
```

### Терминал 3 - Backend:

```bash
cd backend && npm run dev
```

---

## 🔧 Конфигурация

Все настройки в `backend/.env`:

```env
# Постоянная ngrok ссылка (не меняется!)
TELEGRAM_WEBHOOK_URL="https://finer-legal-hedgehog.ngrok-free.app"
TELEGRAM_WEBAPP_URL="https://finer-legal-hedgehog.ngrok-free.app/language"

# Telegram Bot Token
TELEGRAM_BOT_TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"

# CORS разрешения
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3003,https://finer-legal-hedgehog.ngrok-free.app"
```

**Важно:** Эти настройки не нужно менять при каждом запуске! ✅

---

## 🐛 Решение проблем

### Проблема: "ngrok туннель не доступен"

**Решение:** Запустите ngrok с постоянным доменом:

```bash
ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001
```

### Проблема: "Backend уже запущен"

**Решение:** Скрипт автоматически перезапустит его

### Проблема: "Бот не отвечает"

**Решение:**

1. Проверьте что ngrok запущен
2. Проверьте статус: `./check-bot-status.sh`
3. Перезапустите: `./start-bot.sh`

---

## 🛑 Остановка

```bash
# Остановить backend и frontend
pkill -f 'node.*(backend|frontend)'

# Остановить ngrok
pkill ngrok
```

Или просто: **Ctrl+C** в каждом терминале

---

## 📚 Дополнительные команды

```bash
# Проверка статуса
./check-bot-status.sh

# Запуск всей системы
./start-bot.sh

# Проверка backend
curl http://localhost:3001/health

# Проверка через ngrok
curl https://finer-legal-hedgehog.ngrok-free.app/health

# Тест бота
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

---

## 🎯 Workflow на каждый день

```bash
# 1. Утром - запустите ngrok (один раз)
ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001

# 2. Запустите систему
./start-bot.sh

# 3. Работайте с ботом весь день
# URL не меняется!

# 4. Вечером - остановите все
# Ctrl+C в каждом терминале
```

---

## ✅ Преимущества постоянной ссылки

- ✅ **URL не меняется** при перезапуске
- ✅ **Не нужно обновлять** .env
- ✅ **Webhook стабильный** - бот всегда доступен
- ✅ **Можно делиться ссылкой** - она постоянная
- ✅ **Легче отлаживать** - URL всегда один

---

## 🔗 Полезные ссылки

- **Telegram Bot:** https://t.me/transfer_srs_bot
- **Админ панель:** http://localhost:3003/admin/dashboard
- **Водительское приложение:** http://localhost:3003/driver
- **Backend API:** http://localhost:3001
- **Frontend:** http://localhost:3003
- **Публичный URL:** https://finer-legal-hedgehog.ngrok-free.app

---

## 📖 Документация

- [TELEGRAM_CONFIG.md](TELEGRAM_CONFIG.md) - Подробная конфигурация
- [TELEGRAM_DEBUG.md](TELEGRAM_DEBUG.md) - Отладка проблем
- [TELEGRAM_FIX.md](TELEGRAM_FIX.md) - Решение ошибок
- [README.md](README.md) - Главная документация

---

## 🎉 Готово!

Теперь запуск бота максимально простой:

```bash
# 1. Запустите ngrok
ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001

# 2. Запустите систему
./start-bot.sh

# 3. Откройте бота
https://t.me/transfer_srs_bot
```

**Всё работает! 🚗✨**
