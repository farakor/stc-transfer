# Исправление проблемы с Safe Area в Telegram Web App

## Проблема

Когда web app клиента и водителя открывается на полную высоту, header уходит под status bar устройства, и контент становится недоступным.

## Решение

### 1. Обновлен HTML (frontend/index.html)

- ✅ Добавлен `viewport-fit=cover` в meta viewport для поддержки safe area
- ✅ Изменен `apple-mobile-web-app-status-bar-style` на `black-translucent` для прозрачного status bar
- ✅ Убран padding из body, чтобы избежать двойного отступа

### 2. Обновлены CSS стили (frontend/src/index.css)

- ✅ Улучшены утилиты `.safe-area-top` и `.safe-area-bottom`
- ✅ Добавлено использование `max()` для минимальных отступов (8px)
- ✅ Правильная обработка `env(safe-area-inset-top)` и `env(safe-area-inset-bottom)`

### 3. Обновлен ClientLayout (frontend/src/pages/client/ClientLayout.tsx)

- ✅ Добавлен класс `safe-area-top` к header
- ✅ Добавлен класс `safe-area-bottom` к main content и нижней навигации

### 4. Обновлен DriverDashboard (frontend/src/pages/driver/DriverDashboard.tsx)

- ✅ Добавлен класс `safe-area-top` к header

### 5. Улучшен хук useTelegramWebApp (frontend/src/hooks/useTelegramWebApp.ts)

- ✅ Добавлен вызов `tgWebApp.ready()` для инициализации
- ✅ Добавлен вызов `tgWebApp.expand()` для расширения на полную высоту
- ✅ Добавлено логирование информации о viewport

### 6. Создан тестовый файл (tests/test-safe-area.html)

- ✅ Визуальная индикация safe area zones (красная - сверху, синяя - снизу)
- ✅ Отображение информации о viewport и safe area insets
- ✅ Информация о Telegram Web App

## Как работает

### Safe Area Insets

- **safe-area-inset-top**: Отступ сверху для status bar (обычно 20-44px на iOS)
- **safe-area-inset-bottom**: Отступ снизу для home indicator на iOS (обычно 34px на iPhone X и новее)

### Применение стилей

```css
.safe-area-top {
  padding-top: max(env(safe-area-inset-top), 8px);
}

.safe-area-bottom {
  padding-bottom: max(env(safe-area-inset-bottom), 8px);
}
```

Функция `max()` гарантирует минимальный отступ 8px даже на устройствах без safe area.

## Тестирование

### 1. В Telegram

1. Откройте web app в Telegram
2. Проверьте, что header видим и не уходит под status bar
3. Проверьте, что нижняя навигация не перекрывается home indicator

### 2. Использование тестового файла

```bash
# Откройте файл в браузере или через Telegram
open tests/test-safe-area.html
```

Тестовый файл покажет:

- Красные и синие зоны safe area
- Информацию о размерах viewport
- Статус Telegram Web App
- Значения safe area insets

## Поддерживаемые устройства

- ✅ iOS (iPhone X и новее с notch/Dynamic Island)
- ✅ Android
- ✅ Десктоп браузеры
- ✅ Telegram Web App на всех платформах

## Важно

1. **viewport-fit=cover** - обязательный параметр для работы safe area на iOS
2. **black-translucent** - позволяет контенту отображаться под status bar
3. **expand()** - расширяет web app на полную высоту экрана
4. **ready()** - сообщает Telegram, что приложение готово к работе

## Проверка изменений

Сборка фронтенда прошла успешно:

```bash
cd frontend && npm run build
```

## Дополнительные ресурсы

- [MDN: env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [WebKit: Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
- [Telegram Web Apps Documentation](https://core.telegram.org/bots/webapps)
