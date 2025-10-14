# 🚀 Быстрый старт Telegram Bot

## ✅ Ваш бот уже настроен!

**Имя бота:** SRS Transfer  
**Username:** [@transfer_srs_bot](https://t.me/transfer_srs_bot)  
**Статус:** ✅ Активен

---

## 📱 Запуск клиента (3 способа)

### 🟢 Способ 1: Автоматический (РЕКОМЕНДУЕТСЯ)

```bash
./start-telegram-bot.sh
```

Этот скрипт:

- ✅ Запустит ngrok
- ✅ Обновит webhook
- ✅ Запустит backend
- ✅ Покажет ссылку на бота

### 🟡 Способ 2: Ручной запуск

**Терминал 1 - ngrok:**

```bash
ngrok http 3001
```

**Терминал 2 - Backend:**

```bash
cd backend
npm run dev
```

**Обновите URL в `backend/.env`:**

```env
TELEGRAM_WEBHOOK_URL="https://ваш-новый-ngrok-url.ngrok-free.app"
```

### 🔵 Способ 3: Без ngrok (только локально)

Backend уже запущен на `http://localhost:3001`

Но для работы с Telegram нужен публичный URL (используйте способ 1 или 2).

---

## 🔍 Проверка статуса

```bash
./check-bot-status.sh
```

Покажет статус всех компонентов:

- ✅ Бот активен или нет
- ✅ Webhook установлен или нет
- ✅ Backend работает или нет
- ✅ ngrok запущен или нет

---

## 🎯 Тестирование

### 1. Откройте бота в Telegram

**Прямая ссылка:** [https://t.me/transfer_srs_bot](https://t.me/transfer_srs_bot)

Или найдите в поиске: `@transfer_srs_bot`

### 2. Отправьте команду `/start`

Вы увидите:

```
🚗 Добро пожаловать в STC Transfer!

Мы поможем вам заказать комфортный трансфер...
```

### 3. Нажмите кнопку "🚗 Заказать трансфер"

Откроется Web App для создания заказа.

---

## 📊 Текущий статус системы

### ✅ Работает:

- Backend сервер: `http://localhost:3001`
- Telegram Bot: `@transfer_srs_bot`
- База данных: PostgreSQL

### ⚠️ Требует запуска:

- ngrok (для публичного доступа)

---

## 🔧 Полезные команды

### Запуск всей системы

```bash
./start-telegram-bot.sh
```

### Проверка статуса

```bash
./check-bot-status.sh
```

### Только backend

```bash
cd backend && npm run dev
```

### Только ngrok

```bash
ngrok http 3001
```

### Проверка webhook

```bash
# Замените <TOKEN> на ваш токен из backend/.env
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

### Тест backend

```bash
curl http://localhost:3001/health
```

---

## 🐛 Решение проблем

### Бот не отвечает?

1. **Проверьте статус:**

   ```bash
   ./check-bot-status.sh
   ```

2. **Запустите ngrok:**

   ```bash
   ngrok http 3001
   ```

3. **Перезапустите backend:**
   ```bash
   cd backend && npm run dev
   ```

### Webhook не работает?

1. **Проверьте ngrok URL:**

   - Откройте http://localhost:4040
   - Скопируйте публичный URL
   - Обновите `TELEGRAM_WEBHOOK_URL` в `backend/.env`

2. **Перезапустите backend** (чтобы webhook обновился)

### Backend не запускается?

1. **Проверьте базу данных:**

   ```bash
   cd backend
   npx prisma db push
   ```

2. **Установите зависимости:**
   ```bash
   cd backend && npm install
   ```

---

## 📚 Документация

- 📖 **Полное руководство:** [TELEGRAM_CLIENT_GUIDE.md](TELEGRAM_CLIENT_GUIDE.md)
- 🏠 **Главный README:** [README.md](README.md)
- 🚗 **Водительское приложение:** [DRIVER_APP_FINAL.md](documentation/DRIVER_APP_FINAL.md)

---

## 💡 Workflow

```
1. Запустить ngrok → 2. Запустить backend → 3. Открыть бота → 4. Отправить /start
```

---

## 🎉 Готово!

Ваш бот **@transfer_srs_bot** готов к работе!

**Ссылка для клиентов:** https://t.me/transfer_srs_bot

---

## 📞 Нужна помощь?

1. Проверьте [TELEGRAM_CLIENT_GUIDE.md](TELEGRAM_CLIENT_GUIDE.md)
2. Запустите `./check-bot-status.sh`
3. Посмотрите логи backend

**Удачи! 🚗✨**
