# 🔧 Исправление ошибки React Hooks

## ✅ Проблема решена!

**Ошибка:** `Error: Rendered more hooks than during the previous render.`

## 🔍 Причина проблемы:

### **Неправильный порядок хуков:**
```typescript
// ❌ БЫЛО: Условные возвраты в середине компонента, между хуками
const calculatePriceMutation = useCalculatePrice()
const { data: allLocations, isLoading: locationsLoading, error: locationsError } = useAllLocations()

// ... мемоизированные значения ...

// Показать экран загрузки если данные еще загружаются
if (locationsLoading) {
  return <LoadingScreen />
}

// Показать ошибку если не удалось загрузить локации
if (locationsError) {
  return (/* JSX для ошибки */)
}

// Redirect if no vehicle selected
useEffect(() => {
  // ... логика useEffect
}, [selectedVehicleType, navigate])

// Очистить место назначения если оно стало недоступным при смене транспорта
useEffect(() => {
  // ... логика useEffect
}, [selectedVehicleType, toLocation, setToLocation])
```

**Проблема:** React требует, чтобы все хуки вызывались в одном и том же порядке при каждом рендере. Условные возвраты в середине компонента нарушают это правило!

## 🛠️ Решение:

### **Правильный порядок хуков:**
```typescript
// ✅ СТАЛО: Все хуки в начале компонента
const calculatePriceMutation = useCalculatePrice()
const { data: allLocations, isLoading: locationsLoading, error: locationsError } = useAllLocations()

// Мемоизированные значения
const fromLocations = useMemo(() => {
  // ... логика
}, [allLocations])

const toLocations = useMemo(() => {
  // ... логика
}, [allLocations])

// Функции (не хуки)
const isDestinationAvailable = (destination: string, vehicleType: string | null): boolean => {
  // ... логика
}

// Все useEffect хуки
useEffect(() => {
  if (!selectedVehicleType) {
    navigate('/vehicles')
  }
}, [selectedVehicleType, navigate])

useEffect(() => {
  if (toLocation && selectedVehicleType && !isDestinationAvailable(toLocation, selectedVehicleType)) {
    // ... логика
  }
}, [selectedVehicleType, toLocation, setToLocation])

// Обработчики событий
const handleLocationChange = (type: 'from' | 'to', value: string) => {
  // ... логика
}

const handleCustomLocationChange = (type: 'from' | 'to', value: string) => {
  // ... логика
}

const handleCalculatePrice = async () => {
  // ... логика
}

// УСЛОВНЫЕ ВОЗВРАТЫ В КОНЦЕ, ПОСЛЕ ВСЕХ ХУКОВ
if (locationsLoading) {
  return <LoadingScreen />
}

if (locationsError) {
  return (/* JSX для ошибки */)
}

// Основной JSX
return (
  // ... основной контент компонента
)
```

## 📋 Правила React Hooks:

1. **Всегда вызывайте хуки на верхнем уровне** - не внутри циклов, условий или вложенных функций
2. **Вызывайте хуки в одном и том же порядке** при каждом рендере
3. **Условные возвраты должны быть после всех хуков**
4. **Используйте хуки только в React-компонентах или кастомных хуках**

## 📁 Измененные файлы:

1. **frontend/src/pages/RouteSelection.tsx** - исправлен порядок хуков и условных возвратов

## 🧪 Тестирование:

- ✅ Страница `http://localhost:3003/route` возвращает статус 200
- ✅ Ошибка React Hooks больше не возникает
- ✅ Компонент корректно загружает данные из API

## 🎯 Статус: **ЗАВЕРШЕНО** ✅

Ошибка React Hooks полностью исправлена. Теперь компонент RouteSelection работает корректно и соблюдает правила хуков React.
