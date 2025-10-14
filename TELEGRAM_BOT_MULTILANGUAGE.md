# Мультиязычность Telegram-бота

## Обзор

Реализована система выбора языка в Telegram-боте с сохранением предпочтений пользователя. Поддерживаются три языка:

- 🇷🇺 Русский (ru)
- 🇺🇸 English (en)
- 🇺🇿 O'zbek (uz)

## Как это работает

### 1. Первый запуск бота

При первом запуске (`/start`) пользователю показываются инлайн-кнопки для выбора языка:

```
Пожалуйста, выберите язык:
Please select your language:
Iltimos, tilni tanlang:

🇷🇺 Русский
🇺🇸 English
🇺🇿 O'zbek
```

### 2. Сохранение выбора

После выбора языка:

1. Язык сохраняется в базе данных (поле `language_code` в таблице `User`)
2. Показывается приветственное сообщение на выбранном языке
3. Кнопка "Заказать трансфер" открывает Web App с параметром `?lang=ru` (или en/uz)

### 3. Повторные запуски

При последующих запусках:

1. Бот проверяет наличие сохраненного языка в БД
2. Сразу показывает приветственное сообщение на сохраненном языке
3. Выбор языка больше не показывается

### 4. Смена языка

Пользователь может в любой момент изменить язык:

- Нажав кнопку "🌐 Change language / Изменить язык / Tilni o'zgartirish"
- Отправив команду `/language`

## Архитектура

### Backend

#### Файлы переводов

`backend/src/locales/botMessages.ts` содержит все переводы сообщений бота:

```typescript
export const botMessages = {
  ru: {
    welcome: { ... },
    booking: { ... },
    status: { ... },
    ...
  },
  en: { ... },
  uz: { ... }
}
```

#### Telegram Bot Service

`backend/src/services/telegramBot.ts` обработывает:

- `/start` - показывает выбор языка при первом запуске
- `/language` - показывает выбор языка
- Callback queries `lang_ru`, `lang_en`, `lang_uz` - сохраняют выбранный язык
- Callback query `change_language` - показывает выбор языка

Все методы уведомлений (`sendBookingNotification`, `sendStatusUpdateNotification` и т.д.) автоматически получают язык пользователя из БД и отправляют сообщения на его языке.

### Frontend

#### AppRoutes.tsx

Компонент `RootRedirect` отвечает за правильную маршрутизацию при запуске:

```typescript
function RootRedirect() {
  const location = useLocation();
  const { setLanguage } = useAppStore();

  // Проверяем параметр lang в URL
  const urlParams = new URLSearchParams(location.search);
  const langParam = urlParams.get("lang");

  // Если язык в URL, устанавливаем его СРАЗУ
  useEffect(() => {
    if (langParam && ["ru", "en", "uz"].includes(langParam)) {
      setLanguage(langParam as Language);
      localStorage.setItem("language", langParam);
    }
  }, [langParam, setLanguage]);

  const storedLang = localStorage.getItem("language");

  // Если есть язык → на выбор транспорта
  if (langParam || storedLang) {
    return <Navigate to="/vehicles" replace />;
  }

  // Нет языка → на выбор языка
  return <Navigate to="/language" replace />;
}
```

**Важно:** Язык устанавливается в `RootRedirect` (а не в `App.tsx`), чтобы маршрутизация происходила ПОСЛЕ установки языка. Это гарантирует, что при открытии Web App с параметром `?lang=` приложение сразу откроет страницу выбора транспорта, минуя страницу выбора языка.

## База данных

### Поле language_code

Модель `User` в Prisma:

```prisma
model User {
  id            Int       @id @default(autoincrement())
  telegram_id   String    @unique
  language_code String    @default("ru")
  // ... другие поля
}
```

По умолчанию установлен русский язык, но при первом запуске бот предлагает выбрать язык.

## Тестирование

### 1. Первый запуск

```bash
# Запустите бота в Telegram
/start

# Должны увидеть кнопки выбора языка
# Выберите язык, например, English
# Должно появиться приветственное сообщение на английском
```

### 2. Повторный запуск

```bash
# Снова запустите бота
/start

# Должно сразу появиться приветствие на ранее выбранном языке
# Без показа выбора языка
```

### 3. Смена языка

```bash
# Нажмите кнопку "🌐 Change language"
# или отправьте команду
/language

# Должны снова появиться кнопки выбора языка
```

### 4. Web App

```bash
# Нажмите кнопку "Заказать трансфер"
# Web App должно открыться СРАЗУ на странице выбора транспорта
# (БЕЗ показа страницы выбора языка)
# Весь интерфейс должен быть на выбранном языке
# URL должен содержать параметр ?lang=ru (или en/uz)
```

## Обновление переводов

### Добавление нового сообщения

1. Откройте `backend/src/locales/botMessages.ts`

2. Добавьте перевод для всех трех языков:

```typescript
export const botMessages = {
  ru: {
    // ... existing translations
    myNewFeature: {
      title: "Новая функция",
      description: "Описание",
    },
  },
  en: {
    // ... existing translations
    myNewFeature: {
      title: "New Feature",
      description: "Description",
    },
  },
  uz: {
    // ... existing translations
    myNewFeature: {
      title: "Yangi funksiya",
      description: "Tavsif",
    },
  },
};
```

3. Используйте в коде:

```typescript
const messages = getBotMessage(language);
const message = `
${messages.myNewFeature.title}

${messages.myNewFeature.description}
`;
```

## Особенности реализации

### 1. Определение первого запуска

Бот считает запуск первым, если `language_code` равен `'ru'` (значение по умолчанию). Это работает, потому что при явном выборе русского языка пользователем язык также устанавливается в `'ru'`, но при этом приветственное сообщение уже было показано.

### 2. Передача языка в Web App

Язык передается через URL параметр `?lang=`, что позволяет Web App сразу установить правильный язык без показа страницы выбора языка.

### 3. Синхронизация с фронтендом

- Backend сохраняет язык в БД и передает через URL параметр `?lang=`
- Frontend в `RootRedirect` сначала устанавливает язык из URL, затем выполняет маршрутизацию
- Это гарантирует, что при открытии Web App страница выбора языка пропускается
- При последующих запусках Frontend использует язык из localStorage

### 4. Мультиязычные уведомления

Все уведомления (создание заказа, изменение статуса, назначение водителя) автоматически отправляются на языке пользователя, получая его из БД.

## Устранение неполадок

### Язык не сохраняется

Проверьте:

1. База данных доступна
2. Поле `language_code` существует в таблице `User`
3. Webhook работает корректно

### Web App открывается на неправильном языке

Проверьте:

1. URL содержит параметр `?lang=`
2. Frontend корректно считывает параметр
3. localStorage содержит правильное значение

### Кнопки выбора языка не работают

Проверьте:

1. Обработчик `handleCallbackQuery` работает
2. Callback data правильно формируется (`lang_ru`, `lang_en`, `lang_uz`)
3. Метод `updateUserLanguage` не возвращает ошибок

## Будущие улучшения

- Добавить автоопределение языка по Telegram настройкам пользователя
- Добавить больше языков
- Создать админ-панель для управления переводами
- Добавить переводы для Driver-бота
