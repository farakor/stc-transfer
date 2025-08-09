const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Временный API для типов автомобилей
app.get('/api/vehicles/types', (req, res) => {
  const vehicleTypes = [
    {
      type: 'SEDAN',
      name: 'Hongqi EHS 5',
      description: 'Комфортный седан для поездок до 3 пассажиров',
      capacity: 3,
      features: ['Кондиционер', 'Wi-Fi', 'USB зарядка'],
      imageUrl: null,
      pricePerKm: 1500
    },
    {
      type: 'PREMIUM',
      name: 'Hongqi EHS 9',
      description: 'Премиум седан класса люкс для VIP поездок',
      capacity: 3,
      features: ['Кожаные сиденья', 'Панорамная крыша', 'Премиум аудио', 'Wi-Fi'],
      imageUrl: null,
      pricePerKm: 3000
    },
    {
      type: 'MINIVAN',
      name: 'KIA Carnival',
      description: 'Просторный минивэн для группы до 5 человек',
      capacity: 5,
      features: ['Климат-контроль', 'USB зарядка', 'Просторный салон'],
      imageUrl: null,
      pricePerKm: 2000
    },
    {
      type: 'MICROBUS',
      name: 'Mercedes-Benz Sprinter',
      description: 'Микроавтобус для больших групп до 16 человек',
      capacity: 16,
      features: ['Кондиционер', 'Большой багажник', 'Удобные сиденья'],
      imageUrl: null,
      pricePerKm: 2500
    }
  ];

  res.json({
    success: true,
    data: vehicleTypes
  });
});

// Временный API для маршрутов
app.get('/api/routes', (req, res) => {
  const routes = [
    {
      id: 1,
      fromCity: 'Самарканд',
      toCity: 'Аэропорт Самарканда',
      distance: 10,
      duration: 20,
      basePrice: 150000,
      isPopular: true
    },
    {
      id: 2,
      fromCity: 'Самарканд',
      toCity: 'Ж/Д вокзал',
      distance: 8,
      duration: 15,
      basePrice: 100000,
      isPopular: true
    }
  ];

  res.json({
    success: true,
    data: routes
  });
});

// Временный API для расчета стоимости
app.post('/api/routes/calculate-price', (req, res) => {
  const { fromCity, toCity, vehicleType } = req.body;
  
  // Простой расчет
  const basePrice = 100000;
  const typeMultipliers = {
    'SEDAN': 1.5,
    'PREMIUM': 3.0,
    'MINIVAN': 2.0,
    'MICROBUS': 2.5
  };
  
  const totalPrice = basePrice * (typeMultipliers[vehicleType] || 1);
  
  res.json({
    success: true,
    data: {
      routeId: 1,
      routeType: 'FIXED',
      vehicleType,
      basePrice,
      pricePerKm: 1500,
      distance: 10,
      totalPrice,
      currency: 'UZS',
      breakdown: [
        {
          label: 'Базовая стоимость',
          amount: basePrice
        },
        {
          label: 'Доплата за тип транспорта',
          amount: totalPrice - basePrice
        }
      ]
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Temporary API server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Temporary API server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🚗 Vehicle types: http://localhost:${PORT}/api/vehicles/types`);
});