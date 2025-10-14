#!/bin/bash

# Скрипт для тестирования водительского бота
# Использование: ./test-driver-bot.sh YOUR_CHAT_ID

if [ -z "$1" ]; then
    echo "❌ Ошибка: Укажите ваш Chat ID"
    echo "Использование: ./test-driver-bot.sh YOUR_CHAT_ID"
    echo ""
    echo "Чтобы узнать свой Chat ID:"
    echo "1. Откройте @userinfobot в Telegram"
    echo "2. Отправьте любое сообщение"
    echo "3. Скопируйте ваш ID"
    exit 1
fi

CHAT_ID=$1
BOT_TOKEN="8201068723:AAEsIewzuzuQf3Uob9vcjMq78A-SXa4qOIc"

echo "🧪 Отправка тестового сообщения..."
echo "Chat ID: $CHAT_ID"
echo ""

RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{
        \"chat_id\": \"$CHAT_ID\",
        \"text\": \"🧪 Тест водительского бота!\\n\\nЕсли вы получили это сообщение, значит водительский бот @transfer_srs_driver_bot работает правильно! ✅\\n\\nТеперь отправьте /start чтобы получить приветственное сообщение.\"
    }")

echo "Ответ от Telegram:"
echo "$RESPONSE" | jq .

if echo "$RESPONSE" | jq -e '.ok == true' > /dev/null; then
    echo ""
    echo "✅ Сообщение отправлено успешно!"
    echo "Проверьте Telegram - вы должны получить сообщение от водительского бота."
else
    echo ""
    echo "❌ Ошибка отправки сообщения"
fi

