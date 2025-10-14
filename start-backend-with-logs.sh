#!/bin/bash

# Остановим текущий backend
echo "🛑 Останавливаем текущий backend..."
pkill -f "node.*backend"
sleep 2

# Создадим директорию для логов
mkdir -p logs

# Запустим backend с логированием
echo "🚀 Запуск backend с логированием..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &

BACKEND_PID=$!
echo "✅ Backend запущен (PID: $BACKEND_PID)"
echo "📝 Логи сохраняются в: logs/backend.log"
echo ""
echo "📊 Для просмотра логов в реальном времени выполните:"
echo "   tail -f logs/backend.log"
echo ""
echo "Или используйте: ./show-logs.sh"

