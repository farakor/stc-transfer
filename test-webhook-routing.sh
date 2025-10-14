#!/bin/bash

echo "🧪 Тест маршрутизации webhook'ов"
echo "================================"
echo ""

# Тестируем клиентский webhook
echo "1️⃣ Тест клиентского webhook (/webhook):"
RESPONSE=$(curl -s -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "message_id": 999,
      "from": {"id": 12345, "first_name": "Test"},
      "chat": {"id": 12345, "type": "private"},
      "date": 1234567890,
      "text": "/start"
    }
  }')
echo "Ответ: $RESPONSE"
echo ""

# Тестируем водительский webhook
echo "2️⃣ Тест водительского webhook (/webhook/driver):"
RESPONSE=$(curl -s -X POST http://localhost:3001/webhook/driver \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "message_id": 998,
      "from": {"id": 54321, "first_name": "Driver"},
      "chat": {"id": 54321, "type": "private"},
      "date": 1234567890,
      "text": "/start"
    }
  }')
echo "Ответ: $RESPONSE"
echo ""

echo "✅ Проверьте логи backend чтобы увидеть какой бот обработал каждый запрос"
echo "   tail -20 logs/backend-debug.log"

