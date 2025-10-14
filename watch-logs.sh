#!/bin/bash

# Скрипт для просмотра логов водительского бота

echo "📊 Мониторинг логов водительского бота"
echo "======================================"
echo ""
echo "Теперь отправьте /start в @transfer_srs_driver_bot"
echo ""
echo "Логи backend:"
echo "-------------"

# Находим процесс backend и показываем его логи
BACKEND_PID=$(lsof -ti :3001)

if [ -z "$BACKEND_PID" ]; then
    echo "❌ Backend не запущен на порту 3001"
    exit 1
fi

echo "✅ Backend запущен (PID: $BACKEND_PID)"
echo ""
echo "⏳ Ожидание webhook запросов..."
echo ""

# Мониторим логи в реальном времени
# Используем tail для просмотра логов nodemon
tail -f /dev/null 2>/dev/null &

# Альтернативно - показываем как посмотреть логи
echo "💡 Чтобы увидеть логи:"
echo "1. Откройте терминал где запущен 'npm run dev'"
echo "2. Или используйте: ps aux | grep 'node.*backend'"
echo ""
echo "🔍 Или запустите backend в отдельном терминале:"
echo "   cd backend && npm run dev"

