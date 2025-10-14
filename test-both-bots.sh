#!/bin/bash

# Скрипт для проверки обоих ботов

echo "🔍 Проверка Telegram ботов"
echo "=========================="
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Клиентский бот
echo -e "${BLUE}1️⃣ Клиентский бот:${NC}"
CLIENT_TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"
CLIENT_INFO=$(curl -s "https://api.telegram.org/bot$CLIENT_TOKEN/getMe")
CLIENT_USERNAME=$(echo $CLIENT_INFO | jq -r '.result.username')
CLIENT_NAME=$(echo $CLIENT_INFO | jq -r '.result.first_name')

echo "Имя: $CLIENT_NAME"
echo "Username: @$CLIENT_USERNAME"
echo "Ссылка: https://t.me/$CLIENT_USERNAME"

CLIENT_WEBHOOK=$(curl -s "https://api.telegram.org/bot$CLIENT_TOKEN/getWebhookInfo" | jq -r '.result.url')
echo "Webhook: $CLIENT_WEBHOOK"
echo ""

# Водительский бот
echo -e "${BLUE}2️⃣ Водительский бот:${NC}"
DRIVER_TOKEN="8201068723:AAEsIewzuzuQf3Uob9vcjMq78A-SXa4qOIc"
DRIVER_INFO=$(curl -s "https://api.telegram.org/bot$DRIVER_TOKEN/getMe")
DRIVER_USERNAME=$(echo $DRIVER_INFO | jq -r '.result.username')
DRIVER_NAME=$(echo $DRIVER_INFO | jq -r '.result.first_name')

echo "Имя: $DRIVER_NAME"
echo "Username: @$DRIVER_USERNAME"
echo "Ссылка: https://t.me/$DRIVER_USERNAME"

DRIVER_WEBHOOK=$(curl -s "https://api.telegram.org/bot$DRIVER_TOKEN/getWebhookInfo" | jq -r '.result.url')
echo "Webhook: $DRIVER_WEBHOOK"
echo ""

# Проверка
echo -e "${YELLOW}📊 Проверка:${NC}"
if [ "$CLIENT_USERNAME" == "$DRIVER_USERNAME" ]; then
    echo -e "${RED}❌ ОШИБКА: Оба бота имеют одинаковый username!${NC}"
else
    echo -e "${GREEN}✅ Username'ы разные${NC}"
fi

if [ "$CLIENT_WEBHOOK" == "$DRIVER_WEBHOOK" ]; then
    echo -e "${RED}❌ ОШИБКА: Оба бота используют один webhook!${NC}"
else
    echo -e "${GREEN}✅ Webhook'и разные${NC}"
fi

echo ""
echo -e "${YELLOW}💡 Отправьте /start в оба бота:${NC}"
echo "1️⃣ @$CLIENT_USERNAME - должен ответить о бронировании"
echo "2️⃣ @$DRIVER_USERNAME - должен ответить о приложении водителя"

