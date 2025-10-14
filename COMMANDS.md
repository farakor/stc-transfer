# ⚡ Быстрые команды - STC Transfer

## 🚀 Запуск системы

### Telegram Bot (все в одном)

```bash
./start-telegram-bot.sh
```

### Отдельные компоненты

**Backend:**

```bash
cd backend && npm run dev
```

**Frontend:**

```bash
cd frontend && npm run dev
```

**ngrok:**

```bash
ngrok http 3001
```

---

## 🔍 Проверка статуса

**Telegram Bot:**

```bash
./check-bot-status.sh
```

**Backend Health:**

```bash
curl http://localhost:3001/health
```

**Webhook Info:**

```bash
TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"
curl https://api.telegram.org/bot$TOKEN/getWebhookInfo
```

---

## 💾 База данных

**Применить миграции:**

```bash
cd backend && npx prisma migrate dev
```

**Обновить схему:**

```bash
cd backend && npx prisma db push
```

**Открыть Prisma Studio:**

```bash
cd backend && npx prisma studio
```

**Сгенерировать клиент:**

```bash
cd backend && npx prisma generate
```

---

## 👤 Пользователи

**Создать супер-админа:**

```bash
cd backend && npm run create-super-admin
```

**Заполнить базу тестовыми данными:**

```bash
cd backend && npm run db:seed
```

---

## 🧪 Тестирование

**Тест Telegram Bot (веб-интерфейс):**

```
Откройте: test-telegram-bot.html
```

**Тест API:**

```bash
# Health check
curl http://localhost:3001/health

# Все автомобили
curl http://localhost:3001/api/vehicles/all

# Активные заказы
curl http://localhost:3001/api/bookings/active

# Все маршруты
curl http://localhost:3001/api/routes/all
```

---

## 🔧 Разработка

**Просмотр логов (backend):**

```bash
cd backend && npm run dev
# Логи выводятся в консоль
```

**Просмотр ngrok запросов:**

```
Откройте: http://localhost:4040
```

**Сборка production:**

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

---

## 🐛 Отладка

**Удалить webhook:**

```bash
TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"
curl https://api.telegram.org/bot$TOKEN/deleteWebhook
```

**Установить webhook вручную:**

```bash
TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"
URL="https://your-ngrok-url.ngrok-free.app"
curl -X POST https://api.telegram.org/bot$TOKEN/setWebhook \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$URL/webhook\"}"
```

**Очистить базу данных:**

```bash
cd backend && npx prisma migrate reset
```

---

## 📱 Telegram Bot

**Открыть бота:**

```
https://t.me/transfer_srs_bot
```

**Получить информацию о боте:**

```bash
TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"
curl https://api.telegram.org/bot$TOKEN/getMe
```

**Получить обновления (polling):**

```bash
TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"
curl https://api.telegram.org/bot$TOKEN/getUpdates
```

---

## 🌐 URL-адреса

| Сервис                     | URL                                   |
| -------------------------- | ------------------------------------- |
| 🤖 Telegram Bot            | https://t.me/transfer_srs_bot         |
| 🏠 Админ панель            | http://localhost:3003/admin/dashboard |
| 🚗 Водительское приложение | http://localhost:3003/driver          |
| 👤 Клиентское приложение   | http://localhost:3003/vehicles        |
| 🔧 Backend API             | http://localhost:3001                 |
| 🌐 ngrok Dashboard         | http://localhost:4040                 |
| 💾 Prisma Studio           | http://localhost:5555                 |

---

## 📦 Установка зависимостей

**Все проекты:**

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

**Только backend:**

```bash
cd backend && npm install
```

**Только frontend:**

```bash
cd frontend && npm install
```

---

## 🔒 Безопасность

**Переменные окружения (backend/.env):**

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/stc_transfer"
TELEGRAM_BOT_TOKEN="ваш-токен"
TELEGRAM_WEBHOOK_URL="https://ваш-ngrok-url.ngrok-free.app"
JWT_SECRET="ваш-секретный-ключ"
PORT=3001
NODE_ENV=development
```

**⚠️ ВАЖНО:**

- Не коммитьте `.env` файлы
- Храните токены в безопасности
- Используйте разные токены для dev/prod

---

## 🚨 Экстренные команды

**Остановить все процессы:**

```bash
# Нажмите Ctrl+C в каждом терминале
# Или найдите и убейте процессы:
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:3003 | xargs kill -9  # Frontend
lsof -ti:4040 | xargs kill -9  # ngrok
```

**Перезапустить PostgreSQL:**

```bash
brew services restart postgresql
```

**Очистить node_modules:**

```bash
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
cd backend && npm install
cd ../frontend && npm install
```

---

## 📚 Документация

| Документ                                             | Описание                |
| ---------------------------------------------------- | ----------------------- |
| [README.md](README.md)                               | Главная документация    |
| [TELEGRAM_BOT_SUMMARY.md](TELEGRAM_BOT_SUMMARY.md)   | Краткая справка по боту |
| [TELEGRAM_QUICK_START.md](TELEGRAM_QUICK_START.md)   | Быстрый старт бота      |
| [TELEGRAM_CLIENT_GUIDE.md](TELEGRAM_CLIENT_GUIDE.md) | Полное руководство бота |
| [COMMANDS.md](COMMANDS.md)                           | Этот файл               |

---

## 💡 Полезные советы

**1. Сохраните команды в alias (macOS/Linux):**

```bash
# Добавьте в ~/.zshrc или ~/.bashrc
alias stc-bot="cd ~/Documents/cursor/stc-transfer && ./start-telegram-bot.sh"
alias stc-status="cd ~/Documents/cursor/stc-transfer && ./check-bot-status.sh"
alias stc-backend="cd ~/Documents/cursor/stc-transfer/backend && npm run dev"
```

**2. Используйте tmux для управления терминалами:**

```bash
brew install tmux
tmux new -s stc
# Ctrl+B, затем " для разделения
# Ctrl+B, затем стрелки для навигации
```

**3. Постоянный ngrok URL (платная версия):**

```bash
ngrok config add-authtoken <ваш-токен>
ngrok http 3001 --domain=ваш-домен.ngrok-free.app
```

---

## 🎉 Готово!

**Начните работу:**

```bash
./start-telegram-bot.sh
```

**Откройте бота:**
https://t.me/transfer_srs_bot

---

**STC Transfer** 🚗✨
