# 🚀 Быстрый старт: Маппинг автомобилей с Wialon

## ✅ Что сделано

Реализована полная система связывания ваших автомобилей с транспортом в системе Wialon для отслеживания в реальном времени.

### Backend ✅

- ✅ Добавлено поле `wialon_unit_id` в таблицу Vehicle
- ✅ API endpoints для работы с Wialon (/api/wialon/\*)
- ✅ Сервис для получения данных из Wialon
- ✅ Методы связывания автомобилей

### Frontend ✅

- ✅ Компонент `WialonMappingModal` - для связывания автомобилей
- ✅ Компонент `VehicleTracker` - для отслеживания на карте
- ✅ Сервис `wialonApiService` - для работы с API

## 📝 Как использовать

### 1. Связать автомобиль с Wialon (в админ-панели)

В компоненте управления автомобилями добавьте:

```tsx
import WialonMappingModal from '@/components/WialonMappingModal';

// Состояние
const [showWialonModal, setShowWialonModal] = useState(false);
const [selectedVehicle, setSelectedVehicle] = useState(null);

// Кнопка связывания
<button onClick={() => {
  setSelectedVehicle(vehicle);
  setShowWialonModal(true);
}}>
  {vehicle.wialonUnitId ? '🔗 Изменить связь' : '➕ Связать с Wialon'}
</button>

// Модальное окно
<WialonMappingModal
  isOpen={showWialonModal}
  onClose={() => setShowWialonModal(false)}
  vehicle={selectedVehicle}
  onSuccess={() => fetchVehicles()}
/>
```

### 2. Показать карту отслеживания (для клиента)

```tsx
import VehicleTracker from "@/components/VehicleTracker";

// В странице заказа
{
  booking.vehicle?.wialonUnitId && (
    <VehicleTracker
      wialonUnitId={booking.vehicle.wialonUnitId}
      vehicleName={booking.vehicle.name}
      autoRefresh={true}
      refreshInterval={30}
    />
  );
}
```

## 🎯 API Endpoints

### Wialon API

- `GET /api/wialon/units` - список всех единиц
- `GET /api/wialon/units/:unitId` - данные единицы
- `GET /api/wialon/units/:unitId/position` - позиция единицы

### Vehicles API (обновлено)

- `PUT /api/vehicles/:id/wialon` - связать с Wialon
- `GET /api/vehicles/wialon/mapped` - список связанных

## 🔧 Что нужно сделать дальше

### 1. Добавить кнопку маппинга в VehiclesManagement.tsx

Найдите место, где отображается список автомобилей и добавьте кнопку:

```tsx
// В файле: frontend/src/pages/admin/VehiclesManagement.tsx

// Импорты (в начале файла)
import WialonMappingModal from "../../components/WialonMappingModal";
import { Link as LinkIcon } from "lucide-react";

// В состоянии компонента
const [showWialonModal, setShowWialonModal] = useState(false);
const [selectedVehicleForWialon, setSelectedVehicleForWialon] =
  useState<Vehicle | null>(null);

// В списке автомобилей, добавьте кнопку в действиях:
<button
  onClick={() => {
    setSelectedVehicleForWialon(vehicle);
    setShowWialonModal(true);
  }}
  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
  title="Связать с Wialon"
>
  <LinkIcon size={16} />
  Wialon
</button>;

// Перед закрывающим тегом return добавьте модальное окно:
{
  selectedVehicleForWialon && (
    <WialonMappingModal
      isOpen={showWialonModal}
      onClose={() => {
        setShowWialonModal(false);
        setSelectedVehicleForWialon(null);
      }}
      vehicle={selectedVehicleForWialon}
      onSuccess={() => {
        fetchVehicles(true);
      }}
    />
  );
}
```

### 2. Создать страницу отслеживания для клиентов

Создайте новый файл: `frontend/src/pages/TrackingPage.tsx`

```tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import VehicleTracker from "../components/VehicleTracker";
import api from "../services/api";

const TrackingPage: React.FC = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.data);
    } catch (error) {
      console.error("Failed to load booking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!booking?.vehicle?.wialonUnitId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            Отслеживание недоступно
          </h2>
          <p className="text-yellow-700">
            Для этого заказа отслеживание в реальном времени пока недоступно.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Отслеживание заказа
        </h1>
        <p className="text-gray-600">
          Заказ №{booking.id} • {booking.from_location} → {booking.to_location}
        </p>
      </div>

      <VehicleTracker
        wialonUnitId={booking.vehicle.wialonUnitId}
        vehicleName={booking.vehicle.name}
        autoRefresh={true}
        refreshInterval={15}
      />
    </div>
  );
};

export default TrackingPage;
```

### 3. Добавить роут для страницы отслеживания

В `frontend/src/components/AppRoutes.tsx`:

```tsx
import TrackingPage from "../pages/TrackingPage";

// Добавьте роут
<Route path="/tracking/:bookingId" element={<TrackingPage />} />;
```

### 4. Добавить ссылку на отслеживание в детали заказа

В компоненте с деталями заказа:

```tsx
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

{
  booking.vehicle?.wialonUnitId && (
    <Link
      to={`/tracking/${booking.id}`}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      <MapPin size={18} />
      Отследить автомобиль
    </Link>
  );
}
```

## 📊 Примеры данных

### Структура Vehicle с маппингом:

```json
{
  "id": 1,
  "name": "Chevrolet Lacetti",
  "brand": "Chevrolet",
  "model": "Lacetti",
  "license_plate": "01A123BC",
  "wialonUnitId": "123456",
  "status": "AVAILABLE"
}
```

### Структура WialonUnit:

```json
{
  "id": "123456",
  "name": "Chevrolet Lacetti 01A123BC",
  "position": {
    "lat": 41.2995,
    "lng": 69.2401,
    "speed": 45,
    "course": 180,
    "time": 1697123456
  },
  "status": "moving"
}
```

## 🐛 Частые проблемы

### "Failed to get Wialon units"

- Проверьте токен в `.env` файле backend
- Убедитесь, что сервер Wialon доступен

### Карта не показывается

- Установите пакеты: `npm install leaflet react-leaflet`
- Добавьте в компонент: `import 'leaflet/dist/leaflet.css'`

### "Position not available"

- Убедитесь, что GPS-трекер включен
- Проверьте, что юнит передает данные в Wialon

## 🎉 Готово!

Система маппинга готова к использованию. Основные шаги:

1. ✅ Backend полностью настроен
2. ✅ Компоненты созданы
3. 🔨 Интегрируйте в UI (см. выше)
4. 🔨 Создайте страницу отслеживания
5. 🚀 Начните связывать автомобили

---

**Нужна помощь?** Смотрите полную документацию в `WIALON_VEHICLE_MAPPING.md`
