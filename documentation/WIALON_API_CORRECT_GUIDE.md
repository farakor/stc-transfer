# 🔑 Правильное подключение к Wialon API

## 📚 Согласно официальной документации

Согласно [официальной документации Wialon SDK](https://sdk.wialon.com/wiki/en/kit/remoteapi/apiref/login/login):

### ✅ Правильные параметры подключения:

- **Сервер:** `https://176.74.220.111/`
- **API URL:** `https://176.74.220.111/wialon/ajax.html`
- **Токен:** `85991e5f06896e98fe3c0bd49d2fe6d8EC2B0F5F2A7A963F0EC0B869EB87FF8188C6EE8D`
- **Метод авторизации:** `token/login` (новый безопасный способ)

### ⚠️ Важные изменения:

- Старый метод `core/login` **отменен с 01 октября 2015 года**
- Теперь используется новый способ авторизации, похожий на oAuth
- Токены должны быть **72-символьными**

## 🚀 Тестирование

### 1. Быстрый тест

Откройте файл `test-wialon-correct-api.html` и нажмите **"🚀 Тест с правильным API"**

### 2. Что тестируется:

- ✅ HTTPS подключение к правильному API
- ✅ HTTP подключение (резервный вариант)
- ✅ Авторизация с 72-символьным токеном
- ✅ Получение списка транспорта
- ✅ Обновление позиций в реальном времени

## 📋 Обновленная конфигурация

Файл `frontend/src/config/wialon.config.ts` уже обновлен:

```typescript
export const wialonConfig: WialonConfig = {
  // URL согласно документации: {host}/wialon/ajax.html
  baseUrl: "https://176.74.220.111/wialon",

  // 72-символьный токен
  token:
    "85991e5f06896e98fe3c0bd49d2fe6d8EC2B0F5F2A7A963F0EC0B869EB87FF8188C6EE8D",
};
```

## 🔧 API методы согласно документации

### Авторизация:

```
POST https://176.74.220.111/wialon/ajax.html?svc=token/login
Content-Type: application/x-www-form-urlencoded
Body: params={"token":"85991e5f06896e98fe3c0bd49d2fe6d8EC2B0F5F2A7A963F0EC0B869EB87FF8188C6EE8D"}
```

### Поиск транспорта:

```
POST https://176.74.220.111/wialon/ajax.html?svc=core/search_items&sid={session_id}
```

### Обновление данных:

```
POST https://176.74.220.111/wialon/ajax.html?svc=core/update_data_flags&sid={session_id}
```

## 🎯 Проверка в приложении

1. **Запустите приложение:** `cd frontend && npm run dev`
2. **Откройте:** http://localhost:5173
3. **Перейдите:** Админ-панель → вкладка "Обзор"
4. **Результат:** Карта должна показать ваш транспорт

## 🔍 Диагностика проблем

### Если не работает HTTPS:

- Попробуйте HTTP: `http://176.74.220.111/wialon/ajax.html`
- Проверьте сертификат сервера

### Если токен не работает:

- Убедитесь, что токен 72-символьный
- Проверьте срок действия токена
- Попробуйте сгенерировать новый токен

### CORS ошибки:

- Используйте JSONP метод
- Настройте прокси-сервер
- Обратитесь к администратору для настройки CORS

## 📖 Ссылки

- [Официальная документация Wialon SDK](https://sdk.wialon.com/wiki/en/kit/remoteapi/apiref/login/login)
- [Новый способ авторизации](https://sdk.wialon.com/wiki/en/kit/remoteapi/apiref/login/login)
- [API Reference](https://sdk.wialon.com/wiki/en/kit/remoteapi/apiref)

---

**Файлы для тестирования:**

- `test-wialon-correct-api.html` - тест с правильным API
- `frontend/src/config/wialon.config.ts` - обновленная конфигурация
- `frontend/src/services/wialonService.ts` - сервис для работы с API
