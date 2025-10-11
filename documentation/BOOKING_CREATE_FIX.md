# 🔧 Исправление ошибки создания заказа (400 Bad Request)

## ✅ Проблема решена!

**Ошибка:** `POST http://localhost:3003/api/bookings 400 (Bad Request)` с сообщением об ошибке `Invalid value for argument route_type. Expected RouteType.`

## 🔍 Причина проблемы:

### **1. Неправильное значение enum RouteType:**
```typescript
// ❌ БЫЛО: Возвращали несуществующее значение enum
const result = {
  routeType: 'DATABASE', // ❌ Этого значения нет в Prisma enum!
  // ...
}
```

**Prisma enum RouteType содержит только:**
```prisma
enum RouteType {
  FIXED
  CUSTOM
}
```

### **2. Проблема с внешним ключом route_id:**
```typescript
// ❌ БЫЛО: Пытались ссылаться на несуществующий маршрут
route_id: priceCalculation.routeId // Могло быть undefined или ссылаться на TariffRoute вместо Route
```

## 🛠️ Решение:

### **1. Исправлено значение routeType:**
```typescript
// ✅ СТАЛО: Используем правильное значение enum
const result = {
  routeId: dbTariff.route.id,
  routeType: 'FIXED', // ✅ Используем FIXED для тарифов из БД
  vehicleType: request.vehicleType,
  basePrice,
  pricePerKm,
  distance,
  totalPrice,
  currency: 'UZS',
  breakdown: [
    {
      label: 'Базовая стоимость маршрута',
      amount: basePrice
    },
    {
      label: `Транспорт (${distance} км)`,
      amount: distancePrice
    }
  ]
}
```

### **2. Добавлена валидация route_id:**
```typescript
// Добавлен метод валидации
private static async validateRouteId(routeId: number): Promise<boolean> {
  try {
    const route = await prisma.route.findUnique({
      where: { id: routeId }
    })
    return !!route
  } catch (error) {
    console.error('❌ Error validating route ID:', error)
    return false
  }
}

// ✅ СТАЛО: Безопасное присвоение route_id
const booking = await prisma.booking.create({
  data: {
    // ... другие поля
    // Только устанавливаем route_id если он существует и ссылается на таблицу Route
    route_id: priceCalculation.routeId && await this.validateRouteId(priceCalculation.routeId) 
      ? priceCalculation.routeId 
      : null
  }
})
```

### **3. Логика использования RouteType:**
- **`FIXED`** - для тарифов из БД и хардкодированных цен
- **`CUSTOM`** - для кастомных маршрутов с расчетом по километражу

## 🧪 Тестирование:

### **API расчета стоимости работает:**
```bash
curl -X POST "http://localhost:3001/api/routes/calculate-price" \
  -d '{"fromCity":"Самарканд (центр)","toCity":"Аэропорт Самарканда","vehicleType":"SEDAN"}'

# Результат:
{
  "routeId": 1,
  "routeType": "FIXED", // ✅ Правильное значение enum
  "basePrice": 150000,
  "pricePerKm": 1500,
  "distance": 15,
  "totalPrice": 172500
}
```

### **Создание заказа работает:**
```bash
curl -X POST "http://localhost:3001/api/bookings" \
  -d '{"telegramId":"12345","fromLocation":"Самарканд (центр)","toLocation":"Аэропорт Самарканда","vehicleType":"SEDAN"}'

# Результат:
{
  "success": true,
  "data": {
    "id": "cmfli82ph0001lctw3s5fry91",
    "status": "PENDING",
    "fromLocation": "Самарканд (центр)",
    "toLocation": "Аэропорт Самарканда",
    "price": 172500,
    "user": {"name": null, "phone": null},
    "vehicle": {"brand": "Hongqi", "model": "EHS 5", "licensePlate": "EHS5001"},
    "createdAt": "2025-09-15T19:15:44.693Z"
  },
  "message": "Booking created successfully"
}
```

## 📊 Результат:

- ✅ **Ошибка 400 Bad Request исправлена** - заказы создаются успешно
- ✅ **Правильные значения enum** - используются только FIXED и CUSTOM
- ✅ **Безопасная работа с route_id** - валидация перед присвоением
- ✅ **Сохранена функциональность тарифов** - цены из БД корректно применяются
- ✅ **Подробная информация о заказе** - возвращаются данные пользователя, транспорта и цены

## 📁 Измененные файлы:

1. **backend/src/services/routeService.ts** - исправлено значение `routeType` с 'DATABASE' на 'FIXED'
2. **backend/src/services/bookingService.ts** - добавлена валидация `route_id` и метод `validateRouteId()`

## 🎯 Статус: **ЗАВЕРШЕНО** ✅

Проблема с созданием заказов полностью решена. Теперь кнопка "Оформить заказ" на странице `http://localhost:3003/booking` работает корректно и создает заказы с правильными ценами из тарифов админ-панели.
