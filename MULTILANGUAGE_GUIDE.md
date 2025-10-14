# Руководство по мультиязычности

## Обзор

Система мультиязычности реализована для поддержки трех языков:

- 🇷🇺 Русский (ru)
- 🇺🇸 English (en)
- 🇺🇿 O'zbek (uz)

## Архитектура

### Файлы переводов

Переводы находятся в директории `frontend/src/locales/`:

- `ru.ts` - русские переводы (основной язык)
- `en.ts` - английские переводы
- `uz.ts` - узбекские переводы
- `index.ts` - экспорт всех переводов

### Хук useTranslation

Хук `useTranslation` предоставляет доступ к переводам в компонентах:

```typescript
import { useTranslation } from "@/hooks/useTranslation";

function MyComponent() {
  const { t, language } = useTranslation();

  return <h1>{t.common.loading}</h1>;
}
```

### Управление языком

Язык хранится в Zustand store (`frontend/src/services/store.ts`) и сохраняется в localStorage для персистентности между сессиями.

Изменение языка:

```typescript
const { setLanguage } = useAppStore();
setLanguage("en"); // или 'ru', 'uz'
```

## Структура переводов

Переводы организованы по категориям:

### common

Общие термины: кнопки, статусы, сообщения об ошибках

```typescript
t.common.loading; // "Загрузка..."
t.common.save; // "Сохранить"
t.common.error; // "Ошибка"
```

### language

Выбор языка

```typescript
t.language.title; // "Выберите язык"
t.language.russian; // "Русский"
```

### vehicle

Выбор транспорта

```typescript
t.vehicle.title; // "Выберите транспорт"
t.vehicle.passengers; // "пассажиров"
```

### route

Выбор маршрута

```typescript
t.route.from; // "Откуда"
t.route.to; // "Куда"
t.route.calculatePrice; // "Рассчитать стоимость"
```

### booking

Оформление заказа

```typescript
t.booking.title; // "Оформление заказа"
t.booking.orderDetails; // "Детали заказа"
t.booking.submitOrder; // "Оформить заказ"
```

### confirmation

Подтверждение заказа

```typescript
t.confirmation.title; // "Заказ подтвержден!"
t.confirmation.trackOrder; // "Отследить заказ"
```

### bookingStatus

Статусы заказов

```typescript
t.bookingStatus.PENDING; // "Ожидание"
t.bookingStatus.CONFIRMED; // "Подтвержден"
t.bookingStatus.COMPLETED; // "Завершен"
```

## Добавление новых переводов

### 1. Добавьте перевод в ru.ts

```typescript
export const ru = {
  // ... existing translations
  myFeature: {
    title: "Мой заголовок",
    description: "Мое описание",
  },
};
```

### 2. Добавьте переводы в en.ts и uz.ts

```typescript
// en.ts
export const en: Translations = {
  // ... existing translations
  myFeature: {
    title: "My Title",
    description: "My Description",
  },
};

// uz.ts
export const uz: Translations = {
  // ... existing translations
  myFeature: {
    title: "Mening sarlavham",
    description: "Mening tavsifim",
  },
};
```

### 3. Используйте в компоненте

```typescript
function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t.myFeature.title}</h1>
      <p>{t.myFeature.description}</p>
    </div>
  );
}
```

## Обновленные компоненты

Следующие компоненты были обновлены для поддержки мультиязычности:

### Страницы

- ✅ `LanguageSelection.tsx` - выбор языка
- ✅ `VehicleSelection.tsx` - выбор транспорта
- ✅ `RouteSelection.tsx` - выбор маршрута
- ✅ `BookingForm.tsx` - форма бронирования
- ✅ `BookingConfirmation.tsx` - подтверждение заказа

### Компоненты

- ✅ `LoadingScreen.tsx` - экран загрузки
- ✅ `ProgressBar.tsx` - прогресс-бар (принимает переведенные шаги как пропс)

## Динамические переводы

Для шагов бронирования используется динамический массив:

```typescript
const BOOKING_STEPS = [
  t.bookingSteps.language,
  t.bookingSteps.vehicle,
  t.bookingSteps.route,
  t.bookingSteps.details,
  t.bookingSteps.confirmation
]

<ProgressBar steps={BOOKING_STEPS} currentStep={currentStep} />
```

## Форматирование

Некоторые функции форматирования также поддерживают переводы:

```typescript
// Валюта
t.formatting.sum; // "сум" / "sum" / "so'm"

// Статус почасовой оплаты
t.formatting.hourly; // "Почасовая" / "Hourly" / "Soatlik"
```

## Тестирование

Для тестирования разных языков:

1. На странице выбора языка выберите нужный язык
2. Язык сохранится в localStorage
3. При следующем визите будет использован сохраненный язык

## Примечания

- TypeScript автоматически проверяет наличие всех ключей переводов
- Если перевод не найден, будет использован ключ как fallback
- Все иконки локаций (🏙️✈️🚉🏛️📍) остаются универсальными
- Footer "Developed by" остается на английском во всех языках

## Будущие улучшения

Для дальнейшего развития системы мультиязычности можно:

- Добавить больше языков
- Реализовать переводы для admin-панели
- Добавить переводы для driver-приложения
- Реализовать серверную локализацию дат и чисел
