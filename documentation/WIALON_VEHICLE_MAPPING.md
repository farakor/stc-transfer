# 🚗 Руководство по маппингу автомобилей с Wialon

## 📋 Обзор

Реализована система маппинга (связывания) автомобилей из вашей базы данных с единицами транспорта в системе Wialon. Это позволяет отслеживать местоположение автомобилей в реальном времени и предоставлять клиентам информацию о их заказах.

## ✅ Что реализовано

### Backend

#### 1. База данных

- ✅ Добавлено поле `wialon_unit_id` в модель `Vehicle`
- ✅ Создан уникальный индекс для предотвращения дублирования связей
- ✅ Миграция базы данных применена

#### 2. Сервисы

- ✅ `WialonService` - получение данных из Wialon API
  - Авторизация по токену
  - Получение списка единиц транспорта
  - Получение информации о конкретной единице
  - Получение текущей позиции
- ✅ `VehicleService` - управление маппингом
  - Связывание автомобиля с Wialon unit
  - Получение автомобилей с маппингом
  - Поиск автомобиля по Wialon unit ID

#### 3. API Endpoints

**Wialon API:**

- `GET /api/wialon/units` - получить все единицы транспорта
- `GET /api/wialon/units/:unitId` - получить конкретную единицу
- `GET /api/wialon/units/:unitId/position` - получить позицию единицы
- `POST /api/wialon/login` - авторизация в Wialon
- `POST /api/wialon/logout` - выход из Wialon

**Vehicle API (обновлено):**

- `PUT /api/vehicles/:id/wialon` - связать автомобиль с Wialon unit
- `GET /api/vehicles/wialon/mapped` - получить автомобили с маппингом
- Все существующие endpoints обновлены для работы с `wialonUnitId`

### Frontend

#### 1. Сервисы

- ✅ `wialonApiService.ts` - клиент для работы с Wialon API

#### 2. Компоненты

- ✅ `WialonMappingModal` - модальное окно для связывания автомобиля с Wialon unit
- ✅ `VehicleTracker` - компонент для отслеживания автомобиля на карте в реальном времени

## 🔧 Настройка

### Backend

1. **Настройте переменные окружения** в `.env`:

```env
WIALON_BASE_URL=https://gps.ent-en.com/wialon
WIALON_TOKEN=ваш_токен_wialon
```

2. **Примените миграцию базы данных** (уже выполнено):

```bash
cd backend
npx prisma db push
```

### Frontend

Сервисы уже настроены и готовы к использованию.

## 📖 Использование

### 1. Связывание автомобиля с Wialon unit

#### В админ-панели:

```tsx
import WialonMappingModal from '@/components/WialonMappingModal';

// В вашем компоненте управления автомобилями
const [showWialonModal, setShowWialonModal] = useState(false);
const [selectedVehicle, setSelectedVehicle] = useState(null);

// Открытие модального окна
<button onClick={() => {
  setSelectedVehicle(vehicle);
  setShowWialonModal(true);
}}>
  Связать с Wialon
</button>

// Модальное окно
<WialonMappingModal
  isOpen={showWialonModal}
  onClose={() => setShowWialonModal(false)}
  vehicle={selectedVehicle}
  onSuccess={() => {
    // Обновить список автомобилей
    fetchVehicles();
  }}
/>
```

### 2. Отслеживание автомобиля клиентом

```tsx
import VehicleTracker from "@/components/VehicleTracker";

// В странице отслеживания заказа
<VehicleTracker
  wialonUnitId={booking.vehicle.wialonUnitId}
  vehicleName={booking.vehicle.name}
  autoRefresh={true}
  refreshInterval={30} // обновление каждые 30 секунд
/>;
```

### 3. Использование API напрямую

#### Получить список Wialon units:

```typescript
import wialonApiService from "@/services/wialonApiService";

const units = await wialonApiService.getUnits();
console.log("Wialon units:", units);
```

#### Связать автомобиль:

```typescript
const success = await wialonApiService.linkVehicleToWialon(
  vehicleId,
  wialonUnitId
);
```

#### Получить позицию автомобиля:

```typescript
const position = await wialonApiService.getUnitPosition(wialonUnitId);
console.log("Текущая позиция:", position);
```

## 🎨 Интеграция в существующий интерфейс

### VehiclesManagement.tsx

Добавьте кнопку для маппинга в список действий для каждого автомобиля:

```tsx
import { Link as LinkIcon } from "lucide-react";
import WialonMappingModal from "@/components/WialonMappingModal";

// В списке автомобилей добавьте кнопку
<button
  onClick={() => {
    setSelectedVehicleForWialon(vehicle);
    setShowWialonModal(true);
  }}
  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
  title="Связать с Wialon"
>
  <LinkIcon size={16} />
  {vehicle.wialonUnitId ? "Изменить связь" : "Связать с Wialon"}
</button>;

// Индикатор связи с Wialon
{
  vehicle.wialonUnitId && (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
      <CheckCircle size={12} />
      Связан с Wialon
    </span>
  );
}
```

### BookingDetails.tsx

Добавьте отслеживание автомобиля в детали заказа:

```tsx
import VehicleTracker from "@/components/VehicleTracker";

// В деталях заказа
{
  booking.vehicle?.wialonUnitId && (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Отслеживание автомобиля</h3>
      <VehicleTracker
        wialonUnitId={booking.vehicle.wialonUnitId}
        vehicleName={booking.vehicle.name}
        autoRefresh={true}
        refreshInterval={30}
      />
    </div>
  );
}
```

## 🔍 Структура данных

### WialonUnit

```typescript
interface WialonUnit {
  id: string; // ID единицы в Wialon
  name: string; // Название единицы
  position?: {
    lat: number; // Широта
    lng: number; // Долгота
    speed?: number; // Скорость (км/ч)
    course?: number; // Направление (градусы)
    time?: number; // Время последнего обновления (unix timestamp)
  };
  status?: "online" | "offline" | "moving" | "stopped";
}
```

### Vehicle (обновлено)

```typescript
interface Vehicle {
  // ... существующие поля
  wialonUnitId?: string | null; // ID единицы в Wialon
}
```

## 🐛 Решение проблем

### Ошибка: "Failed to get Wialon units"

**Причина:** Неверный токен или проблемы с подключением к Wialon.

**Решение:**

1. Проверьте правильность токена в `.env`
2. Проверьте доступность сервера Wialon
3. Проверьте логи backend: `npm run dev` в папке backend

### Ошибка: "Position not available"

**Причина:** У единицы транспорта нет данных о местоположении.

**Решение:**

1. Проверьте, что GPS-трекер включен и работает
2. Проверьте, что единица передает данные в Wialon
3. Подождите несколько минут для получения данных

### Карта не отображается

**Причина:** Leaflet CSS не загружен.

**Решение:**

1. Убедитесь, что установлен пакет: `npm install leaflet react-leaflet`
2. Импортируйте CSS: `import 'leaflet/dist/leaflet.css'`

## 📊 Примеры использования

### 1. Админ-панель: Массовое связывание

```tsx
const linkAllVehicles = async () => {
  const units = await wialonApiService.getUnits();
  const vehicles = await vehicleService.getAllVehicles();

  // Автоматическое связывание по названию
  for (const vehicle of vehicles) {
    const matchingUnit = units.find((unit) =>
      unit.name.includes(vehicle.license_plate)
    );

    if (matchingUnit) {
      await wialonApiService.linkVehicleToWialon(vehicle.id, matchingUnit.id);
    }
  }
};
```

### 2. Клиентский интерфейс: Страница отслеживания

```tsx
const OrderTrackingPage: React.FC = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    loadBooking(bookingId);
  }, [bookingId]);

  if (!booking?.vehicle?.wialonUnitId) {
    return <p>Отслеживание недоступно для этого заказа</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Отслеживание заказа #{booking.id}
      </h1>

      <VehicleTracker
        wialonUnitId={booking.vehicle.wialonUnitId}
        vehicleName={booking.vehicle.name}
        autoRefresh={true}
        refreshInterval={15}
      />
    </div>
  );
};
```

## 🚀 Следующие шаги

1. **Добавьте маппинг в VehiclesManagement.tsx**

   - Кнопка для связывания с Wialon
   - Индикатор текущей связи
   - Возможность отвязки

2. **Создайте страницу отслеживания для клиентов**

   - Доступна по ссылке из деталей заказа
   - Показывает текущее местоположение
   - Обновляется автоматически

3. **Добавьте уведомления**

   - Уведомление клиенту при приближении автомобиля
   - Уведомление при изменении статуса
   - История передвижений

4. **Оптимизация**
   - Кэширование позиций
   - WebSocket для real-time обновлений
   - Offline режим с сохранением последней позиции

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи backend
2. Проверьте консоль браузера
3. Убедитесь, что Wialon API доступен
4. Проверьте правильность токена

---

**Статус:** ✅ Полностью реализовано и готово к использованию
**Дата:** 12 октября 2024
