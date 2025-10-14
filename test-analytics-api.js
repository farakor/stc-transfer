const axios = require("axios");

const API_URL = "http://localhost:3001/api";
const ADMIN_TOKEN = "your-admin-token"; // Замените на реальный токен

async function testAnalyticsEndpoints() {
  console.log("🧪 Тестирование аналитических эндпоинтов...\n");

  const headers = {
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    // 1. Тест метрик в реальном времени
    console.log("1️⃣ Тестирование метрик в реальном времени...");
    const realtimeResponse = await axios.get(
      `${API_URL}/admin/analytics/realtime`,
      { headers }
    );
    console.log(
      "✅ Метрики в реальном времени:",
      JSON.stringify(realtimeResponse.data, null, 2)
    );
    console.log("");

    // 2. Тест данных о выручке
    console.log("2️⃣ Тестирование данных о выручке (неделя)...");
    const revenueResponse = await axios.get(
      `${API_URL}/admin/analytics/revenue`,
      {
        headers,
        params: { period: "week" },
      }
    );
    console.log(
      "✅ Данные о выручке:",
      JSON.stringify(revenueResponse.data, null, 2)
    );
    console.log("");

    // 3. Тест популярных маршрутов
    console.log("3️⃣ Тестирование популярных маршрутов...");
    const routesResponse = await axios.get(
      `${API_URL}/admin/analytics/popular-routes`,
      { headers }
    );
    console.log(
      "✅ Популярные маршруты:",
      JSON.stringify(routesResponse.data, null, 2)
    );
    console.log("");

    // 4. Тест производительности водителей
    console.log("4️⃣ Тестирование производительности водителей...");
    const driversResponse = await axios.get(
      `${API_URL}/admin/analytics/driver-performance`,
      { headers }
    );
    console.log(
      "✅ Производительность водителей:",
      JSON.stringify(driversResponse.data, null, 2)
    );
    console.log("");

    // 5. Тест данных о статусах заказов
    console.log("5️⃣ Тестирование данных о статусах заказов (неделя)...");
    const statusResponse = await axios.get(
      `${API_URL}/admin/analytics/orders-status`,
      {
        headers,
        params: { period: "week" },
      }
    );
    console.log(
      "✅ Данные о статусах:",
      JSON.stringify(statusResponse.data, null, 2)
    );
    console.log("");

    console.log("🎉 Все тесты пройдены успешно!");
  } catch (error) {
    console.error(
      "❌ Ошибка при тестировании:",
      error.response?.data || error.message
    );
    if (error.response?.status === 401) {
      console.log("\n⚠️  Пожалуйста, обновите ADMIN_TOKEN в скрипте.");
      console.log(
        "   Получите токен, войдя в админ-панель и проверив localStorage."
      );
    }
  }
}

// Запуск тестов
testAnalyticsEndpoints();
