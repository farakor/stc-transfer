# Обновление: Добавлено поле "Количество чемоданов"

## Дата: 12 октября 2025

## Описание изменений

Добавлена возможность указывать количество чемоданов для каждого автомобиля при его регистрации. Ранее это значение было захардкожено как `Math.floor(capacity / 2)`.

## Выполненные изменения

### 1. База данных (Backend)

#### Schema Prisma (`backend/prisma/schema.prisma`)

- ✅ Добавлено поле `baggage_capacity Int @default(2)` в модель `Vehicle`

#### Миграция БД

- ✅ Создана миграция: `20251012195403_add_baggage_capacity_to_vehicle/migration.sql`
- ✅ Миграция успешно применена к базе данных
- ✅ Prisma Client обновлен с новыми типами

#### API Controller (`backend/src/controllers/vehicleController.ts`)

- ✅ Обновлен маппинг в `getAvailableVehicles()` - добавлено `baggageCapacity: vehicle.baggage_capacity`
- ✅ Обновлен маппинг в `getVehicleById()` - добавлено `baggageCapacity: vehicle.baggage_capacity`
- ✅ Обновлен маппинг в `getAllVehicles()` - добавлено `baggageCapacity: vehicle.baggage_capacity`
- ✅ Обновлен маппинг в `createVehicle()` - добавлено `baggageCapacity: vehicle.baggage_capacity`
- ✅ Обновлен маппинг в `updateVehicle()` - добавлено `baggageCapacity: vehicle.baggage_capacity`
- ✅ Обновлен маппинг в `getVehicleTypes()` - изменено с захардкоженного `Math.floor(vehicle.capacity / 2)` на `vehicle.baggage_capacity`

### 2. Админ-панель (Frontend)

#### Интерфейсы TypeScript (`frontend/src/pages/admin/VehiclesManagement.tsx`)

- ✅ Добавлено поле `baggageCapacity: number` в интерфейс `Vehicle`
- ✅ Добавлено поле `baggageCapacity: number` в интерфейс `VehicleFormData`

#### Форма создания/редактирования автомобиля

- ✅ Добавлено новое поле ввода "Количество чемоданов" с валидацией (0-20)
- ✅ Поле размещено между "Вместимость (человек)" и "Тариф (сум/км)"
- ✅ Дефолтное значение: 2 чемодана

#### Обновлены все функции управления автомобилями:

- ✅ `handleCreate()` - начальное значение `baggageCapacity: 2`
- ✅ `handleEdit()` - загрузка `baggageCapacity` из данных автомобиля
- ✅ `handleEditSubVehicle()` - загрузка `baggageCapacity` из данных автомобиля
- ✅ `handleEditGroup()` - загрузка `baggageCapacity` из данных группы
- ✅ `handleAddMoreVehicles()` - копирование `baggageCapacity` из существующего автомобиля
- ✅ `handleSubmit()` - включение `baggageCapacity` в данные при создании/обновлении

### 3. Клиентская часть

Поле уже использовалось на клиентской стороне (`frontend/src/pages/VehicleSelection.tsx` строка 128):

```tsx
🧳 {vehicle.baggageCapacity} чемодана
```

Теперь это значение берется из базы данных, а не вычисляется автоматически.

## Результат

Теперь администраторы могут:

1. Указывать точное количество чемоданов при добавлении нового автомобиля
2. Изменять количество чемоданов при редактировании существующих автомобилей
3. Клиенты видят корректное количество чемоданов при выборе автомобиля

## Дефолтные значения

- **Новые автомобили**: 2 чемодана (можно изменить в форме)
- **Существующие автомобили**: 2 чемодана (применено через миграцию БД)

## Исправление бага (12 октября 2025)

### Проблема

После первоначальной реализации обнаружено, что данные не сохранялись в базу, хотя интерфейс показывал успешное сохранение.

### Решение

Добавлено недостающее поле `baggage_capacity` в методы сервиса (`backend/src/services/vehicleService.ts`):

- ✅ В `createVehicle()` (строка 75): `baggage_capacity: vehicleData.baggageCapacity || 2`
- ✅ В `updateVehicle()` (строка 119): `baggage_capacity: vehicleData.baggageCapacity || 2`

Теперь данные корректно сохраняются в базу данных при создании и обновлении автомобилей.

## Проверка изменений

1. Линтер: ✅ Ошибок не найдено
2. Prisma Client: ✅ Успешно сгенерирован
3. Миграция БД: ✅ Успешно применена
4. TypeScript типы: ✅ Все типы обновлены
5. VehicleService: ✅ Поле корректно сохраняется в БД

## Как использовать

1. Откройте админ-панель → Транспорт
2. При создании/редактировании автомобиля найдите поле "Количество чемоданов"
3. Укажите нужное количество (от 0 до 20)
4. Сохраните изменения

Клиенты автоматически увидят обновленную информацию при выборе транспорта.
