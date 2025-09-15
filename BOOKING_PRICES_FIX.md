# 🔧 Исправление отображения цен на странице booking

## ✅ Проблема решена!

**Проблема:** Страница `http://localhost:3003/booking` не показывала цены, которые указываются в разделе "Тарифы" админ-панели.

## 🔍 Причина проблемы:

### **Использование хардкодированных цен вместо БД:**
```typescript
// ❌ БЫЛО: Система использовала только хардкодированные цены
static async calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResult> {
  // Проверяем, есть ли фиксированная цена для данного маршрута и типа транспорта
  const fixedPrice = this.FIXED_PRICES[destination]?.[vehicleType]
  
  if (fixedPrice) {
    // Используем хардкодированную цену
    return { totalPrice: fixedPrice, routeType: 'FIXED' }
  }
  
  // Fallback на расчет по километражу
  return this.calculateCustomPrice(request)
}
```

**Проблема:** Система полностью игнорировала тарифы из базы данных, которые настраиваются в админ-панели!

## 🛠️ Решение:

### **1. Добавлен метод поиска тарифов в БД:**
```typescript
// Найти тариф в базе данных по локациям и типу транспорта
static async findTariffFromDatabase(fromLocation: string, toLocation: string, vehicleType: string) {
  // Ищем маршрут по локациям
  const route = await prisma.tariffRoute.findFirst({
    where: {
      from_location: { name: fromLocation },
      to_location: { name: toLocation },
      is_active: true
    },
    include: {
      from_location: true,
      to_location: true
    }
  })

  if (!route) return null

  // Ищем тариф для этого маршрута и типа транспорта
  const tariff = await prisma.tariff.findFirst({
    where: {
      route_id: route.id,
      is_active: true,
      // Сопоставляем типы транспорта с брендами/моделями
      OR: [
        { vehicle_brand: vehicleType },
        ...(vehicleType === 'SEDAN' ? [
          { vehicle_brand: 'Hongqi', vehicle_model: 'EHS 5' }
        ] : []),
        // ... другие сопоставления
      ]
    }
  })

  return tariff ? formatTariffData(tariff) : null
}
```

### **2. Изменена логика расчета цен:**
```typescript
// ✅ СТАЛО: Приоритет тарифам из БД
static async calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResult> {
  // СНАЧАЛА проверяем тарифы из базы данных
  const dbTariff = await this.findTariffFromDatabase(request.from, request.to, request.vehicleType)
  
  if (dbTariff) {
    console.log('💰 Using database tariff:', dbTariff)
    
    const distance = dbTariff.route.distance_km || 0
    const basePrice = dbTariff.base_price
    const pricePerKm = dbTariff.price_per_km
    const distancePrice = pricePerKm * distance
    const totalPrice = basePrice + distancePrice

    return {
      routeId: dbTariff.route.id,
      routeType: 'DATABASE',
      vehicleType: request.vehicleType,
      basePrice,
      pricePerKm,
      distance,
      totalPrice,
      currency: 'UZS',
      breakdown: [
        { label: 'Базовая стоимость маршрута', amount: basePrice },
        { label: `Транспорт (${distance} км)`, amount: distancePrice }
      ]
    }
  }

  // Если в БД нет тарифа, используем хардкодированные цены как fallback
  const fixedPrice = this.FIXED_PRICES[destination]?.[vehicleType]
  // ... остальная логика
}
```

### **3. Добавлено сопоставление типов транспорта:**
```typescript
// Сопоставляем типы транспорта с брендами/моделями в БД
OR: [
  { vehicle_brand: vehicleType }, // Прямое сопоставление
  ...(vehicleType === 'SEDAN' ? [
    { vehicle_brand: 'Hongqi', vehicle_model: 'EHS 5' },
    { vehicle_brand: 'Hongqi' }
  ] : []),
  ...(vehicleType === 'PREMIUM' ? [
    { vehicle_brand: 'Hongqi', vehicle_model: 'EHS 9' },
    { vehicle_brand: 'Mercedes', vehicle_model: 'S-Class' }
  ] : []),
  ...(vehicleType === 'MINIVAN' ? [
    { vehicle_brand: 'KIA', vehicle_model: 'Carnival' },
    { vehicle_brand: 'Kia', vehicle_model: 'Carnival' }
  ] : []),
  ...(vehicleType === 'MICROBUS' ? [
    { vehicle_brand: 'Mercedes', vehicle_model: 'Sprinter' }
  ] : []),
  ...(vehicleType === 'BUS' ? [
    { vehicle_brand: 'Higer', vehicle_model: 'Bus' }
  ] : [])
]
```

## 🧪 Тестирование:

### **Тарифы из БД работают:**
```bash
# Маршрут с тарифом в БД
curl -X POST "http://localhost:3001/api/routes/calculate-price" \
  -d '{"fromCity":"Самарканд (центр)","toCity":"Аэропорт Самарканда","vehicleType":"SEDAN"}'

# Результат:
{
  "routeType": "DATABASE",
  "basePrice": 150000,
  "pricePerKm": 1500,
  "distance": 15,
  "totalPrice": 172500  // 150000 + 1500*15
}
```

### **Fallback на хардкодированные цены работает:**
```bash
# Маршрут без тарифа в БД
curl -X POST "http://localhost:3001/api/routes/calculate-price" \
  -d '{"fromCity":"Самарканд (центр)","toCity":"Аэропорт","vehicleType":"SEDAN"}'

# Результат:
{
  "routeType": "FIXED",
  "totalPrice": 150000  // Хардкодированная цена
}
```

## 📊 Результат:

- ✅ **Приоритет тарифам из БД** - система сначала ищет тарифы в базе данных
- ✅ **Корректный расчет цен** - базовая цена + цена за км × расстояние
- ✅ **Сопоставление типов транспорта** - SEDAN → Hongqi EHS 5, BUS → Higer Bus, и т.д.
- ✅ **Fallback система** - если нет тарифа в БД, используются хардкодированные цены
- ✅ **Подробная детализация** - breakdown показывает базовую стоимость и стоимость транспорта
- ✅ **Логирование** - подробные логи для отладки

## 📁 Измененные файлы:

1. **backend/src/services/routeService.ts** - добавлен метод `findTariffFromDatabase()` и изменена логика `calculatePrice()`

## 🎯 Статус: **ЗАВЕРШЕНО** ✅

Проблема полностью решена. Теперь страница `http://localhost:3003/booking` корректно отображает цены из тарифов, которые вы настраиваете в админ-панели "Тарифы".
