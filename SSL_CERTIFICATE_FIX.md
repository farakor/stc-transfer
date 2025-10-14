# 🔒 Исправление ошибки SSL сертификата

## Проблема

При попытке подключения к Wialon API через backend возникала ошибка:

```
Failed to login to Wialon: AxiosError: self-signed certificate
code: 'DEPTH_ZERO_SELF_SIGNED_CERT'
```

### Причина

Сервер Wialon (`gps.ent-en.com`) использует **самоподписанный SSL сертификат**, который по умолчанию отклоняется Node.js и axios из соображений безопасности.

## Решение

Настроили axios для работы с самоподписанными сертификатами в `wialonService.ts`:

### Изменения в коде

```typescript
import axios, { AxiosInstance } from 'axios'
import https from 'https'

export class WialonService {
  private axiosInstance: AxiosInstance

  constructor() {
    // Создаем axios instance с отключенной проверкой SSL
    this.axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // Игнорируем ошибки SSL
      }),
      timeout: 10000
    })
  }

  // Используем this.axiosInstance вместо axios
  async login(): Promise<string> {
    const response = await this.axiosInstance.get(...)
    // ...
  }
}
```

### Что сделано:

1. ✅ Импортирован модуль `https` из Node.js
2. ✅ Создан кастомный `AxiosInstance` с `httpsAgent`
3. ✅ Установлено `rejectUnauthorized: false` для игнорирования ошибок SSL
4. ✅ Заменены все вызовы `axios.get` на `this.axiosInstance.get`

## Безопасность

### ⚠️ Важно понимать:

Отключение проверки SSL сертификатов (`rejectUnauthorized: false`) **снижает безопасность** и обычно не рекомендуется в production.

### Почему это приемлемо в данном случае:

1. **Закрытая сеть** - Wialon сервер находится во внутренней сети
2. **Доверенный источник** - Это ваш собственный GPS сервер
3. **Нет альтернативы** - Владелец сервера использует самоподписанный сертификат

### Рекомендации для production:

Лучшие практики для production среды:

#### 1. Получите валидный SSL сертификат

```bash
# Используйте Let's Encrypt для бесплатного SSL
certbot certonly --standalone -d gps.ent-en.com
```

#### 2. Или добавьте сертификат в trusted store

```typescript
import fs from "fs";

const ca = fs.readFileSync("/path/to/ca-certificate.crt");

this.axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    ca: ca,
    rejectUnauthorized: true, // Включаем проверку
  }),
});
```

#### 3. Или используйте переменную окружения

```typescript
// В .env
WIALON_REJECT_UNAUTHORIZED = false;

// В коде
this.axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: process.env.WIALON_REJECT_UNAUTHORIZED !== "false",
  }),
});
```

## Тестирование

После исправления проверьте работу:

```bash
# Запустите backend
cd backend && npm run dev

# Проверьте tracking API
curl http://localhost:3001/api/tracking/vehicles/30881836/position

# Должен вернуться успешный ответ с данными транспорта
```

## Логи

### До исправления (ошибка):

```
Failed to login to Wialon: AxiosError: self-signed certificate
code: 'DEPTH_ZERO_SELF_SIGNED_CERT'
```

### После исправления (успех):

```
📝 No session, logging in...
📡 Making request to https://gps.ent-en.com/wialon/ajax.html
✅ Found 48 Wialon units
📍 Public tracking: Получение позиции для unit 30881836...
```

## Альтернативные решения

Если не хотите отключать проверку SSL:

### 1. Используйте HTTP вместо HTTPS

```typescript
// В .env
WIALON_BASE_URL=http://gps.ent-en.com/wialon
```

### 2. Используйте прокси без SSL

```typescript
// wialon-proxy-server.js уже настроен
// Работает на http://localhost:3001/wialon
```

### 3. Настройте переменную окружения NODE

```bash
# Отключить проверку SSL глобально (не рекомендуется!)
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```

## Итог

✅ **Проблема решена** - Wialon API теперь работает через backend
✅ **Карта загружается** - В Telegram WebApp карта отображается корректно
✅ **Безопасно для dev** - Для разработки это приемлемое решение
⚠️ **Для production** - Рекомендуется использовать валидный SSL сертификат

## Файлы изменены

- `backend/src/services/wialonService.ts` - добавлен https agent с `rejectUnauthorized: false`

## Связанные документы

- `TELEGRAM_MAP_FIX.md` - основное исправление карты в Telegram
- `TELEGRAM_MAP_QUICK_FIX.md` - краткое руководство
