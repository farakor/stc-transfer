#!/bin/bash

echo "🧪 Тестирование Tracking API для Telegram WebApp"
echo "=================================================="
echo ""

# Проверяем, запущен ли backend
echo "1️⃣ Проверка backend..."
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ Backend не запущен на порту 3001"
    echo "   Запустите: cd backend && npm run dev"
    exit 1
else
    echo "✅ Backend работает"
fi

echo ""
echo "2️⃣ Тестирование Tracking API..."
echo ""

# Получаем первый заказ для теста
BOOKING=$(curl -s http://localhost:3001/api/bookings | jq -r '.data[0]')
BOOKING_ID=$(echo $BOOKING | jq -r '.id')
VEHICLE_WIALON_ID=$(echo $BOOKING | jq -r '.vehicle.wialonUnitId // empty')

if [ -z "$VEHICLE_WIALON_ID" ] || [ "$VEHICLE_WIALON_ID" == "null" ]; then
    echo "⚠️  Нет заказа с привязанным транспортом Wialon"
    echo "   Используем тестовый ID: 30881836"
    VEHICLE_WIALON_ID="30881836"
else
    echo "📦 Найден заказ: $BOOKING_ID"
    echo "🚗 Wialon Unit ID: $VEHICLE_WIALON_ID"
fi

echo ""
echo "3️⃣ Запрос позиции транспорта..."
echo "   URL: http://localhost:3001/api/tracking/vehicles/$VEHICLE_WIALON_ID/position"
echo ""

RESPONSE=$(curl -s http://localhost:3001/api/tracking/vehicles/$VEHICLE_WIALON_ID/position)

# Проверяем успешность запроса
if echo $RESPONSE | jq -e '.success' > /dev/null 2>&1; then
    SUCCESS=$(echo $RESPONSE | jq -r '.success')
    
    if [ "$SUCCESS" == "true" ]; then
        echo "✅ Запрос успешен!"
        echo ""
        echo "📍 Данные транспорта:"
        echo "   ID: $(echo $RESPONSE | jq -r '.data.id')"
        echo "   Название: $(echo $RESPONSE | jq -r '.data.name')"
        echo "   Статус: $(echo $RESPONSE | jq -r '.data.status')"
        
        if echo $RESPONSE | jq -e '.data.position' > /dev/null 2>&1; then
            echo ""
            echo "🗺️  Позиция:"
            echo "   Широта: $(echo $RESPONSE | jq -r '.data.position.lat')"
            echo "   Долгота: $(echo $RESPONSE | jq -r '.data.position.lng')"
            echo "   Скорость: $(echo $RESPONSE | jq -r '.data.position.speed') км/ч"
            echo "   Направление: $(echo $RESPONSE | jq -r '.data.position.course')°"
        else
            echo "⚠️  Позиция недоступна"
        fi
    else
        echo "❌ Запрос вернул ошибку:"
        echo $RESPONSE | jq '.'
    fi
else
    echo "❌ Ошибка при запросе:"
    echo $RESPONSE
fi

echo ""
echo "4️⃣ Проверка frontend..."

if ! curl -s http://localhost:3003 > /dev/null; then
    echo "⚠️  Frontend не запущен на порту 3003"
    echo "   Запустите: cd frontend && npm run dev"
else
    echo "✅ Frontend работает на http://localhost:3003"
    
    if [ ! -z "$BOOKING_ID" ] && [ "$BOOKING_ID" != "null" ]; then
        echo ""
        echo "🔗 Ссылки для тестирования:"
        echo "   Статус заказа: http://localhost:3003/status/$BOOKING_ID"
        echo "   Отслеживание: http://localhost:3003/tracking/$BOOKING_ID"
    fi
fi

echo ""
echo "=================================================="
echo "✅ Тестирование завершено!"
echo ""
echo "📝 Для теста в Telegram:"
echo "   1. Откройте Telegram бот"
echo "   2. Создайте заказ или выберите существующий"
echo "   3. Перейдите на страницу статуса заказа"
echo "   4. Карта должна загрузиться автоматически"
echo ""

