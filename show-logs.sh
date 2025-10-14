#!/bin/bash

# Скрипт для просмотра логов в реальном времени

LOG_FILE="logs/backend.log"

if [ ! -f "$LOG_FILE" ]; then
    echo "❌ Файл логов не найден: $LOG_FILE"
    echo ""
    echo "Запустите backend с логированием:"
    echo "   ./start-backend-with-logs.sh"
    exit 1
fi

echo "📊 Логи backend (Ctrl+C для выхода)"
echo "===================================="
echo ""

# Показываем последние 50 строк и следим за новыми
tail -f -n 50 "$LOG_FILE"

