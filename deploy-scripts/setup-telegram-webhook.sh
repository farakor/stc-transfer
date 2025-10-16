#!/bin/bash
# Скрипт настройки Telegram Webhook

set -e

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

DOMAIN="srs.faruk.io"

echo "🤖 Настройка Telegram Webhook..."
echo ""

# 1. Основной бот (клиентский)
read -p "Введите токен основного (клиентского) бота: " CLIENT_BOT_TOKEN

if [ -z "$CLIENT_BOT_TOKEN" ]; then
    print_error "Токен бота обязателен"
    exit 1
fi

print_info "Установка webhook для клиентского бота..."
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$CLIENT_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"https://$DOMAIN/api/telegram/webhook\",
    \"allowed_updates\": [\"message\", \"callback_query\", \"inline_query\"]
  }")

if echo "$RESPONSE" | grep -q '"ok":true'; then
    print_success "Webhook для клиентского бота установлен"
else
    print_error "Ошибка установки webhook"
    echo "$RESPONSE"
    exit 1
fi

# Проверка webhook
print_info "Проверка webhook клиентского бота..."
curl -s "https://api.telegram.org/bot$CLIENT_BOT_TOKEN/getWebhookInfo" | python3 -m json.tool

echo ""
echo ""

# 2. Водительский бот (опционально)
read -p "Есть ли отдельный водительский бот? (yes/no): " HAS_DRIVER_BOT

if [ "$HAS_DRIVER_BOT" = "yes" ]; then
    read -p "Введите токен водительского бота: " DRIVER_BOT_TOKEN
    
    if [ -n "$DRIVER_BOT_TOKEN" ]; then
        print_info "Установка webhook для водительского бота..."
        RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$DRIVER_BOT_TOKEN/setWebhook" \
          -H "Content-Type: application/json" \
          -d "{
            \"url\": \"https://$DOMAIN/api/telegram/driver-webhook\",
            \"allowed_updates\": [\"message\", \"callback_query\"]
          }")
        
        if echo "$RESPONSE" | grep -q '"ok":true'; then
            print_success "Webhook для водительского бота установлен"
        else
            print_error "Ошибка установки webhook"
            echo "$RESPONSE"
        fi
        
        # Проверка webhook
        print_info "Проверка webhook водительского бота..."
        curl -s "https://api.telegram.org/bot$DRIVER_BOT_TOKEN/getWebhookInfo" | python3 -m json.tool
    fi
fi

echo ""
print_success "🎉 Настройка Telegram webhook завершена!"
echo ""
echo "Проверьте боты отправив им команду /start"
echo ""

