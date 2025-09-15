# 🚌 Исправление пустой модалки назначения автобуса

## Проблема
При нажатии на кнопку "Назначить автомобиль" для заказа на автобус модалка была пустая.

## Причина
API автомобилей (`GET /api/vehicles`) не возвращал информацию о водителях. Модалка фильтрует автомобили по условию:
```javascript
v.status === 'AVAILABLE' && 
v.driver?.status === 'AVAILABLE' &&
(!requiredType || v.type === requiredType)
```

Без информации о водителе (`v.driver?.status`) фильтрация не работала.

## Исправления

### 1. ✅ Обновлен VehicleService.getAvailableVehicles()

**Файл:** `backend/src/services/vehicleService.ts`

**Было:**
```typescript
static async getAvailableVehicles() {
  return await prisma.vehicle.findMany({
    orderBy: {
      name: 'asc'
    }
  })
}
```

**Стало:**
```typescript
static async getAvailableVehicles() {
  return await prisma.vehicle.findMany({
    include: {
      driver: true  // ← Добавлено включение водителя
    },
    orderBy: {
      name: 'asc'
    }
  })
}
```

### 2. ✅ Обновлен VehicleController.getAvailableVehicles()

**Файл:** `backend/src/controllers/vehicleController.ts`

**Добавлено в ответ API:**
```typescript
const vehicleData = vehicles.map(vehicle => ({
  id: vehicle.id,
  type: vehicle.type,
  name: vehicle.name,
  capacity: vehicle.capacity,
  pricePerKm: vehicle.price_per_km,
  imageUrl: vehicle.image_url,
  description: vehicle.description,
  features: vehicle.features || [],
  isAvailable: true,
  // ↓ Добавлены новые поля
  status: vehicle.status,
  licensePlate: vehicle.license_plate,
  brand: vehicle.brand,
  model: vehicle.model,
  driver: vehicle.driver ? {
    id: vehicle.driver.id,
    name: vehicle.driver.name,
    phone: vehicle.driver.phone,
    status: vehicle.driver.status
  } : null
}))
```

## Результат

### ✅ Теперь API возвращает полную информацию:
```json
{
  "id": 2,
  "type": "BUS",
  "name": "Автобус Higer",
  "status": "AVAILABLE",
  "licensePlate": "HIGER001",
  "brand": "Higer",
  "model": "Bus",
  "driver": {
    "id": 2,
    "name": "Рахимов Бахтиёр",
    "phone": "+998 93 456 78 90",
    "status": "AVAILABLE"
  }
}
```

### ✅ Модалка назначения теперь показывает:
- **Автобус Higer Bus** (HIGER001)
- **Водитель:** Рахимов Бахтиёр
- **Вместимость:** 30 чел.

### ✅ Фильтрация работает правильно:
- Для заказов на автобус показываются только автобусы
- Только автомобили со статусом `AVAILABLE`
- Только с водителями со статусом `AVAILABLE`

## Проверка работы

### 1. Создание заказа на автобус:
1. Выберите "Автобус Higer" в форме заказа
2. Заполните маршрут и отправьте
3. В админ-панели должно показаться "Требуется: Автобус"

### 2. Назначение автобуса:
1. Нажмите кнопку 🚗 "Назначить автомобиль"
2. Должен показаться автобус "Higer Bus" с водителем
3. После назначения статус изменится на "Подтвержден"

### 3. Тестовый файл:
Открыть `test-vehicle-modal.html` в браузере для детального тестирования фильтрации.

## Файлы изменены:
- `backend/src/services/vehicleService.ts` - добавлено включение водителя
- `backend/src/controllers/vehicleController.ts` - расширен ответ API
- `test-vehicle-modal.html` - тестовый файл (создан)

## База данных:
- Автобус Higer (ID=2) с водителем Рахимов Бахтиёр (ID=2)
- Оба со статусом AVAILABLE

---
*Исправлено: 15 сентября 2025*
