# Отладка мультиязычности

## Проблема: Web App открывает страницу выбора языка вместо выбора транспорта

### Шаги для отладки:

#### 1. Проверьте логи бота

После выбора языка в боте проверьте логи backend:

```bash
cd backend
npm run dev
# или
tail -f logs/backend.log
```

Ищите строки:

```
🌐 Sending Web App URL: https://your-url.com?lang=ru
🌐 Language: ru
✅ Welcome message sent successfully
```

**Проверка:** URL должен содержать `?lang=ru` (или en/uz)

#### 2. Проверьте консоль браузера

Откройте Web App и откройте консоль браузера (обычно F12):

```
1. Нажмите на кнопку "Заказать трансфер" в боте
2. В консоли должны появиться логи:

✅ Language set from URL in RootRedirect: ru
✅ Language found in localStorage: ru
✅ Redirecting to /vehicles with language: ru
```

**Если видите:**

```
❌ No language found, redirecting to /language
```

Это значит параметр `lang` не передан или не считан.

#### 3. Проверьте URL в адресной строке

В Telegram Web App посмотрите URL (может понадобиться открыть в отдельном окне браузера):

**Правильный URL:**

```
https://your-domain.com/?lang=ru#/
```

**Неправильный URL (без параметра):**

```
https://your-domain.com/#/
```

#### 4. Проверьте переменные окружения

В файле `backend/.env` должна быть правильная переменная:

```bash
TELEGRAM_WEBAPP_URL=https://your-domain.com
```

**Проверка:**

```bash
cd backend
cat .env | grep TELEGRAM_WEBAPP_URL
```

#### 5. Проверьте localStorage

В консоли браузера выполните:

```javascript
localStorage.getItem("language");
```

Должно вернуть: `"ru"` или `"en"` или `"uz"`

#### 6. Очистите кэш и localStorage

Если проблема сохраняется:

```javascript
// В консоли браузера
localStorage.clear();
// Перезагрузите приложение
```

### Возможные причины проблемы:

#### Причина 1: TELEGRAM_WEBAPP_URL не установлен

**Решение:**

```bash
# В backend/.env добавьте:
TELEGRAM_WEBAPP_URL=https://your-actual-domain.com
```

#### Причина 2: URL параметр теряется

Telegram иногда удаляет параметры из URL. **Решение:**

- Используйте hash-based routing вместо query parameters
- ИЛИ храните язык в Telegram.WebApp.initData

#### Причина 3: Параметр добавляется после

**Неправильно:**

```
https://domain.com/#/?lang=ru
```

**Правильно:**

```
https://domain.com/?lang=ru#/
```

### Альтернативное решение (если параметры теряются)

Если Telegram удаляет query параметры, можно использовать hash:

#### В боте (telegramBot.ts):

```typescript
const urlWithLang = `${webAppUrl}#lang=${language}`;
```

#### Во фронтенде (AppRoutes.tsx):

```typescript
// Вместо URLSearchParams
const hash = location.hash.substring(1); // Убираем #
const langParam = hash.startsWith("lang=") ? hash.substring(5, 7) : null;
```

### Тестирование в локальной разработке

Для тестирования локально откройте в браузере:

```
http://localhost:5173/?lang=ru
```

Должно сразу перенаправить на `/vehicles`

### Тестирование через ngrok

Если используете ngrok для разработки:

```bash
# 1. Запустите ngrok
ngrok http 5173

# 2. Обновите TELEGRAM_WEBAPP_URL в backend/.env
TELEGRAM_WEBAPP_URL=https://your-ngrok-url.ngrok.io

# 3. Перезапустите backend
cd backend
npm run dev

# 4. Протестируйте в Telegram
```

### Проверка работы маршрутизации

Выполните в консоли браузера:

```javascript
// Проверка текущего location
console.log("URL:", window.location.href);
console.log("Search:", window.location.search);
console.log(
  "Lang param:",
  new URLSearchParams(window.location.search).get("lang")
);
console.log("LocalStorage:", localStorage.getItem("language"));
```

### Если ничего не помогает

1. **Удалите бота из Telegram** и добавьте снова
2. **Очистите все данные** в DevTools → Application → Clear site data
3. **Проверьте сеть** в DevTools → Network при открытии Web App
4. **Проверьте, что webhook работает** правильно

### Свяжитесь с разработчиком

Если проблема сохраняется, соберите следующую информацию:

1. Логи из консоли браузера
2. Логи из backend
3. Значение `process.env.TELEGRAM_WEBAPP_URL`
4. URL, который видите в адресной строке
5. Скриншот сообщения от бота с кнопкой
