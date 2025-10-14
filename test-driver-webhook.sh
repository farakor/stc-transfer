#!/bin/bash

# Тест водительского бота

echo "🧪 Тестирование водительского бота"
echo "=================================="

DRIVER_TOKEN="8201068723:AAEsIewzuzuQf3Uob9vcjMq78A-SXa4qOIc"

# Отправим тестовое сообщение через Telegram API напрямую
echo "📤 Отправка тестового сообщения..."

# Нужен chat_id - для теста используем метод getUpdates, чтобы получить последние обновления
UPDATES=$(curl -s "https://api.telegram.org/bot$DRIVER_TOKEN/getUpdates")
echo "Последние обновления от водительского бота:"
echo "$UPDATES" | jq '.'

echo ""
echo "💡 Отправьте /start в @transfer_srs_driver_bot и запустите этот скрипт снова"

