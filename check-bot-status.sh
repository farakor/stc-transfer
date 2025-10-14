#!/bin/bash

# Скрипт проверки статуса Telegram Bot
# Использование: ./check-bot-status.sh

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Проверка статуса Telegram Bot"
echo "================================="
echo ""

# Проверка .env файла
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Файл backend/.env не найден!${NC}"
    exit 1
fi

# Получение токена
BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN backend/.env | cut -d '=' -f2 | tr -d '"')
WEBHOOK_URL=$(grep TELEGRAM_WEBHOOK_URL backend/.env | cut -d '=' -f2 | tr -d '"')

if [ -z "$BOT_TOKEN" ]; then
    echo -e "${RED}❌ TELEGRAM_BOT_TOKEN не найден в .env${NC}"
    exit 1
fi

echo -e "${BLUE}📱 Проверка информации о боте...${NC}"

# Получение информации о боте
BOT_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe")
BOT_USERNAME=$(echo $BOT_INFO | grep -o '"username":"[^"]*"' | cut -d':' -f2 | tr -d '"')
BOT_NAME=$(echo $BOT_INFO | grep -o '"first_name":"[^"]*"' | cut -d':' -f2 | tr -d '"')
BOT_OK=$(echo $BOT_INFO | grep -o '"ok":true')

if [ -z "$BOT_OK" ]; then
    echo -e "${RED}❌ Не удалось получить информацию о боте${NC}"
    echo -e "${RED}   Проверьте правильность токена${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Бот активен${NC}"
echo -e "   Имя: ${BLUE}$BOT_NAME${NC}"
echo -e "   Username: ${BLUE}@$BOT_USERNAME${NC}"
echo -e "   Ссылка: ${BLUE}https://t.me/$BOT_USERNAME${NC}"
echo ""

# Проверка webhook
echo -e "${BLUE}🔗 Проверка webhook...${NC}"
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
CURRENT_WEBHOOK=$(echo $WEBHOOK_INFO | grep -o '"url":"[^"]*"' | cut -d':' -f2- | tr -d '"')
PENDING_UPDATES=$(echo $WEBHOOK_INFO | grep -o '"pending_update_count":[0-9]*' | cut -d':' -f2)
LAST_ERROR=$(echo $WEBHOOK_INFO | grep -o '"last_error_message":"[^"]*"' | cut -d':' -f2 | tr -d '"')

if [ -z "$CURRENT_WEBHOOK" ] || [ "$CURRENT_WEBHOOK" = "" ]; then
    echo -e "${YELLOW}⚠️  Webhook не установлен${NC}"
    echo -e "   Webhook будет установлен при запуске backend"
else
    echo -e "${GREEN}✅ Webhook установлен${NC}"
    echo -e "   URL: ${BLUE}$CURRENT_WEBHOOK${NC}"
    
    if [ ! -z "$PENDING_UPDATES" ] && [ "$PENDING_UPDATES" != "0" ]; then
        echo -e "${YELLOW}⚠️  Ожидающих обновлений: $PENDING_UPDATES${NC}"
    fi
    
    if [ ! -z "$LAST_ERROR" ]; then
        echo -e "${RED}❌ Последняя ошибка: $LAST_ERROR${NC}"
    fi
fi
echo ""

# Проверка backend
echo -e "${BLUE}🖥️  Проверка backend сервера...${NC}"
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null)

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Backend запущен и работает${NC}"
    echo -e "   URL: ${BLUE}http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Backend не отвечает${NC}"
    echo -e "   Запустите: ${YELLOW}cd backend && npm run dev${NC}"
fi
echo ""

# Проверка ngrok
echo -e "${BLUE}🌐 Проверка ngrok...${NC}"
NGROK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4040/api/tunnels 2>/dev/null)

if [ "$NGROK_STATUS" = "200" ]; then
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)
    echo -e "${GREEN}✅ ngrok запущен${NC}"
    echo -e "   Публичный URL: ${BLUE}$NGROK_URL${NC}"
    echo -e "   Dashboard: ${BLUE}http://localhost:4040${NC}"
    
    # Проверка соответствия URL
    if [ "$CURRENT_WEBHOOK" != "$NGROK_URL/webhook" ] && [ ! -z "$NGROK_URL" ]; then
        echo -e "${YELLOW}⚠️  Webhook URL не совпадает с ngrok URL${NC}"
        echo -e "   Webhook: $CURRENT_WEBHOOK"
        echo -e "   ngrok: $NGROK_URL/webhook"
        echo -e "   ${YELLOW}Перезапустите backend для обновления${NC}"
    fi
else
    echo -e "${RED}❌ ngrok не запущен${NC}"
    echo -e "   Запустите: ${YELLOW}ngrok http 3001${NC}"
fi
echo ""

# Итоговый статус
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}📊 Итоговый статус${NC}"
echo -e "${GREEN}========================================${NC}"

ALL_OK=true

if [ -z "$BOT_OK" ]; then
    echo -e "❌ Бот: ${RED}Не активен${NC}"
    ALL_OK=false
else
    echo -e "✅ Бот: ${GREEN}Активен (@$BOT_USERNAME)${NC}"
fi

if [ -z "$CURRENT_WEBHOOK" ] || [ "$CURRENT_WEBHOOK" = "" ]; then
    echo -e "⚠️  Webhook: ${YELLOW}Не установлен${NC}"
    ALL_OK=false
else
    echo -e "✅ Webhook: ${GREEN}Установлен${NC}"
fi

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "✅ Backend: ${GREEN}Работает${NC}"
else
    echo -e "❌ Backend: ${RED}Не запущен${NC}"
    ALL_OK=false
fi

if [ "$NGROK_STATUS" = "200" ]; then
    echo -e "✅ ngrok: ${GREEN}Работает${NC}"
else
    echo -e "❌ ngrok: ${RED}Не запущен${NC}"
    ALL_OK=false
fi

echo ""

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}🎉 Все системы работают!${NC}"
    echo -e "${GREEN}   Бот готов к использованию: https://t.me/$BOT_USERNAME${NC}"
else
    echo -e "${YELLOW}⚠️  Некоторые компоненты не работают${NC}"
    echo -e "${YELLOW}   Запустите: ./start-telegram-bot.sh${NC}"
fi

echo ""

