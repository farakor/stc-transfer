#!/bin/bash

echo "🚀 Демонстрация полного цикла заказа STC Transfer"
echo "=================================================="
echo ""

# Базовый URL API
API_URL="http://localhost:3001"

echo "📋 1. Получение списка доступных транспортных средств:"
echo "------------------------------------------------------"
curl -s "$API_URL/api/vehicles" | jq '.data[] | {id, type, name, capacity, pricePerKm, description}'
echo ""

echo "🗺️  2. Получение популярных маршрутов:"
echo "--------------------------------------"
curl -s "$API_URL/api/routes/popular" | jq '.data[] | {id, name, fromCity, toCity, distance, basePrice}'
echo ""

echo "💰 3. Расчет стоимости поездки (Ташкент → Самарканд, Эконом, 2 пассажира):"
echo "--------------------------------------------------------------------------"
PRICE_RESPONSE=$(curl -s -X POST "$API_URL/api/routes/calculate-price" \
  -H "Content-Type: application/json" \
  -d '{"fromCity":"Ташкент","toCity":"Самарканд","vehicleType":"economy","passengerCount":2}')

echo $PRICE_RESPONSE | jq '.data | {vehicleType, distance, totalPrice, currency, breakdown}'
TOTAL_PRICE=$(echo $PRICE_RESPONSE | jq '.data.totalPrice')
echo ""

echo "👤 4. Создание/регистрация пользователя:"
echo "----------------------------------------"
USER_RESPONSE=$(curl -s -X POST "$API_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"telegramId":"123456789","firstName":"Ахмад","lastName":"Каримов","languageCode":"ru"}')

echo $USER_RESPONSE | jq '.data'
USER_ID=$(echo $USER_RESPONSE | jq '.data.id')
echo ""

echo "📝 5. Создание заказа:"
echo "----------------------"
BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/api/bookings" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID,
    \"vehicleId\": 1,
    \"routeId\": 1,
    \"passengerCount\": 2,
    \"totalPrice\": $TOTAL_PRICE,
    \"pickupLocation\": \"Гостиница Узбекистан, Ташкент\",
    \"dropoffLocation\": \"Регистан, Самарканд\",
    \"pickupTime\": \"2025-08-10T09:00:00.000Z\",
    \"notes\": \"Встреча у главного входа гостиницы в 09:00\"
  }")

echo $BOOKING_RESPONSE | jq '.data'
BOOKING_ID=$(echo $BOOKING_RESPONSE | jq '.data.id')
echo ""

echo "🔍 6. Проверка статуса заказа:"
echo "-------------------------------"
curl -s "$API_URL/api/bookings/$BOOKING_ID" | jq '.data | {id, status, totalPrice, pickupLocation, dropoffLocation, pickupTime}'
echo ""

echo "✅ Полный цикл заказа успешно протестирован!"
echo "============================================="
echo ""
echo "📱 Frontend доступен на: http://localhost:3003"
echo "🔧 API Backend доступен на: http://localhost:3001"
echo ""
echo "🎯 Основные endpoint'ы для тестирования:"
echo "• GET /api/vehicles - список транспорта"
echo "• GET /api/routes - список маршрутов"
echo "• POST /api/routes/calculate-price - расчет стоимости"
echo "• POST /api/users - регистрация пользователя"
echo "• POST /api/bookings - создание заказа"
echo "• GET /api/bookings/:id - статус заказа"
