# Исправленные ошибки в авторизации водителей

## Дата: 14 октября 2025

### Ошибка 1: Неправильный путь импорта API

**Проблема:**

```
Failed to resolve import "@/utils/api" from "src/pages/driver/DriverTelegramAuth.tsx"
```

**Причина:**

- Файл API находится в `services/api.ts`, а не в `utils/api.ts`
- Импорт был указан неправильно

**Решение:**

```typescript
// Было:
import api from "@/utils/api";

// Стало:
import { api } from "@/services/api";
```

**Файл:** `frontend/src/pages/driver/DriverTelegramAuth.tsx`

---

### Улучшение: Поддержка токена водителя в API интерсепторе

**Проблема:**

- API интерсептор не добавлял токен водителя к запросам
- Проверялись только `authToken` (клиент) и `adminToken` (админ)

**Решение:**
Добавлена проверка `driverAuthToken` в интерсепторе запросов:

```typescript
// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Добавляем токен авторизации из localStorage
    // Проверяем клиентский, водительский и админский токены
    const authToken = localStorage.getItem("authToken");
    const driverAuthToken = localStorage.getItem("driverAuthToken");
    const adminToken = localStorage.getItem("adminToken");

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    } else if (driverAuthToken) {
      config.headers.Authorization = `Bearer ${driverAuthToken}`;
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    console.log(
      `🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);
```

**Файл:** `frontend/src/services/api.ts`

**Преимущества:**

- ✅ Токен водителя автоматически добавляется ко всем API запросам
- ✅ Не нужно вручную добавлять заголовок `Authorization`
- ✅ Единообразная обработка для всех типов пользователей (клиент, водитель, админ)

---

## Проверка

### Статус всех файлов:

- ✅ `DriverTelegramAuth.tsx` - без ошибок
- ✅ `api.ts` - без ошибок
- ✅ Все зависимости разрешены корректно

### Тестирование:

1. **Импорты разрешаются:**

```bash
✅ @/services/api - найден
✅ @/hooks/useTelegramWebApp - найден
✅ lucide-react - найден
```

2. **API токены:**

```javascript
// Клиент
localStorage.getItem('authToken') → Bearer token в заголовке

// Водитель
localStorage.getItem('driverAuthToken') → Bearer token в заголовке

// Админ
localStorage.getItem('adminToken') → Bearer token в заголовке
```

---

## Итоги

Все критические ошибки исправлены. Приложение готово к тестированию:

1. ✅ Импорты работают корректно
2. ✅ API интерсептор поддерживает все типы токенов
3. ✅ Нет ошибок линтера
4. ✅ TypeScript типы корректны

**Следующий шаг:** Протестировать авторизацию водителя в Telegram webapp.
