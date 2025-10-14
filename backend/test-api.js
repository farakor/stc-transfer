const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Тестовые данные
const vehicles = [
  {
    id: 1,
    type: "economy",
    name: "Hyundai Solaris",
    capacity: 4,
    pricePerKm: 15.5,
    imageUrl: "/images/solaris.jpg",
    description: "Удобный седан эконом класса",
    features: ["кондиционер", "багажник", "4 места"],
    isAvailable: true,
  },
  {
    id: 2,
    type: "comfort",
    name: "Toyota Camry",
    capacity: 4,
    pricePerKm: 22.0,
    imageUrl: "/images/camry.jpg",
    description: "Комфортный седан бизнес класса",
    features: ["кожаный салон", "климат контроль", "Wi-Fi"],
    isAvailable: true,
  },
];

const routes = [
  {
    id: 1,
    fromCity: "Ташкент",
    toCity: "Самарканд",
    distance: 312,
    duration: 240,
    basePrice: 350.0,
    isPopular: true,
  },
  {
    id: 2,
    fromCity: "Ташкент",
    toCity: "Бухара",
    distance: 467,
    duration: 300,
    basePrice: 450.0,
    isPopular: true,
  },
];

// API endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: "development",
  });
});

app.get("/api/vehicles", (req, res) => {
  res.json({
    success: true,
    data: vehicles,
    total: vehicles.length,
  });
});

// GET /api/vehicles/types - Получить типы автомобилей
app.get("/api/vehicles/types", (req, res) => {
  const vehicleTypes = [
    {
      type: "economy",
      name: "Эконом",
      description: "Комфортные автомобили эконом класса",
      capacity: 4,
      features: ["Кондиционер", "Багажник", "Комфортные сиденья"],
      imageUrl: "/images/economy.jpg",
      pricePerKm: 15.5,
    },
    {
      type: "comfort",
      name: "Комфорт",
      description: "Автомобили повышенной комфортности",
      capacity: 4,
      features: ["Кожаный салон", "Климат контроль", "Wi-Fi"],
      imageUrl: "/images/comfort.jpg",
      pricePerKm: 22.0,
    },
    {
      type: "premium",
      name: "Премиум",
      description: "Премиальные автомобили класса люкс",
      capacity: 4,
      features: ["Премиум салон", "Массаж", "Панорамная крыша"],
      imageUrl: "/images/premium.jpg",
      pricePerKm: 35.0,
    },
    {
      type: "minivan",
      name: "Минивэн",
      description: "Просторные автомобили для больших компаний",
      capacity: 7,
      features: ["7 мест", "Большой багажник", "Семейный комфорт"],
      imageUrl: "/images/minivan.jpg",
      pricePerKm: 28.0,
    },
  ];

  res.json({
    success: true,
    data: vehicleTypes,
  });
});

app.get("/api/routes", (req, res) => {
  res.json({
    success: true,
    data: routes,
    total: routes.length,
  });
});

app.get("/api/routes/popular", (req, res) => {
  const popularRoutes = routes
    .filter((r) => r.isPopular)
    .map((route) => ({
      ...route,
      name: `${route.fromCity} → ${route.toCity}`,
      type: "city",
      icon: route.toCity.includes("Самарканд") ? "🏛️" : "🕌",
    }));

  res.json({
    success: true,
    data: popularRoutes,
  });
});

// POST /api/routes/calculate-price - Расчет стоимости
app.post("/api/routes/calculate-price", (req, res) => {
  const { fromCity, toCity, vehicleType, passengerCount = 1 } = req.body;

  const route = routes.find(
    (r) => r.fromCity === fromCity && r.toCity === toCity
  );
  const vehicle = vehicles.find((v) => v.type === vehicleType);

  if (!vehicle) {
    return res.status(400).json({
      success: false,
      error: "Vehicle type not found",
    });
  }

  const basePrice = route ? route.basePrice : 100;
  const distance = route ? route.distance : 50;
  const distancePrice = vehicle.pricePerKm * distance;
  const totalPrice = basePrice + distancePrice;

  res.json({
    success: true,
    data: {
      routeId: route ? route.id : null,
      vehicleType,
      basePrice,
      pricePerKm: vehicle.pricePerKm,
      distance,
      totalPrice,
      currency: "UZS",
      breakdown: [
        {
          label: "pricing.baseRouteCost",
          amount: basePrice,
        },
        {
          label: "pricing.transportDistance",
          amount: distancePrice,
          distance: distance,
        },
      ],
    },
  });
});

// POST /api/users - Создание/обновление пользователя
app.post("/api/users", (req, res) => {
  const { telegramId, firstName, lastName, languageCode = "ru" } = req.body;

  res.json({
    success: true,
    data: {
      id: Date.now(),
      telegramId,
      firstName,
      lastName,
      languageCode,
      createdAt: new Date().toISOString(),
    },
  });
});

// POST /api/bookings - Создание заказа
let bookings = [];
app.post("/api/bookings", (req, res) => {
  console.log("📝 Received booking request:", req.body);

  const {
    telegramId,
    fromLocation,
    toLocation,
    vehicleType,
    pickupTime,
    notes,
    distanceKm,
  } = req.body;

  // Find vehicle and route for pricing
  const vehicle = vehicles.find((v) => v.type === vehicleType);
  const route = routes.find(
    (r) => r.fromCity === fromLocation && r.toCity === toLocation
  );

  const basePrice = route ? route.basePrice : 100;
  const distance = route ? route.distance : distanceKm || 50;
  const pricePerKm = vehicle ? vehicle.pricePerKm : 15.5;
  const totalPrice = basePrice + pricePerKm * distance;

  const booking = {
    id: Date.now(),
    telegramId,
    vehicleId: vehicle ? vehicle.id : 1,
    routeId: route ? route.id : null,
    fromLocation,
    toLocation,
    vehicleType,
    distance,
    totalPrice,
    pickupTime,
    status: "pending",
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  bookings.push(booking);

  console.log("✅ Created booking:", booking);

  res.json({
    success: true,
    data: booking,
  });
});

// GET /api/bookings/:id - Получение заказа
app.get("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  const booking = bookings.find((b) => b.id == id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: "Booking not found",
    });
  }

  res.json({
    success: true,
    data: booking,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test API Server running on port ${PORT}`);
});
