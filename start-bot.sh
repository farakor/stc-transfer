#!/bin/bash

# Упрощенный скрипт запуска Telegram Bot с постоянной ngrok ссылкой
# Использование: ./start-bot.sh

echo "🚀 Запуск STC Transfer Telegram Bot"
echo "===================================="
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Постоянная ngrok ссылка
NGROK_URL="https://finer-legal-hedgehog.ngrok-free.app"

# Проверка .env файла
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Файл backend/.env не найден!${NC}"
    exit 1
fi

echo -e "${BLUE}📝 Шаг 1: Проверка конфигурации...${NC}"
echo -e "   Постоянный URL: ${GREEN}$NGROK_URL${NC}"

# Проверка что URL правильный в .env
CURRENT_WEBHOOK=$(grep TELEGRAM_WEBHOOK_URL backend/.env | cut -d '=' -f2 | tr -d '"')
if [ "$CURRENT_WEBHOOK" != "$NGROK_URL" ]; then
    echo -e "${YELLOW}⚠️  Обновление URL в .env...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|TELEGRAM_WEBHOOK_URL=.*|TELEGRAM_WEBHOOK_URL=\"$NGROK_URL\"|g" backend/.env
        sed -i '' "s|TELEGRAM_WEBAPP_URL=.*|TELEGRAM_WEBAPP_URL=\"$NGROK_URL/language\"|g" backend/.env
    else
        sed -i "s|TELEGRAM_WEBHOOK_URL=.*|TELEGRAM_WEBHOOK_URL=\"$NGROK_URL\"|g" backend/.env
        sed -i "s|TELEGRAM_WEBAPP_URL=.*|TELEGRAM_WEBAPP_URL=\"$NGROK_URL/language\"|g" backend/.env
    fi
    echo -e "${GREEN}✅ URL обновлен${NC}"
else
    echo -e "${GREEN}✅ URL актуален${NC}"
fi

echo ""
echo -e "${BLUE}📝 Шаг 2: Проверка запущенных сервисов...${NC}"

# Проверка Frontend
if lsof -Pi :3003 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✅ Frontend уже запущен (порт 3003)${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend не запущен${NC}"
    echo -e "${BLUE}   Запуск Frontend...${NC}"
    cd frontend
    npm run dev > /dev/null 2>&1 &
    FRONTEND_PID=$!
    cd ..
    sleep 3
    echo -e "${GREEN}✅ Frontend запущен (PID: $FRONTEND_PID)${NC}"
fi

# Проверка Backend
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Backend уже запущен (порт 3001)${NC}"
    echo -e "${YELLOW}   Перезапускаю Backend для применения изменений...${NC}"
    pkill -f "node.*backend" 2>/dev/null
    sleep 2
fi

echo -e "${BLUE}   Запуск Backend...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..
sleep 5
echo -e "${GREEN}✅ Backend запущен (PID: $BACKEND_PID)${NC}"

# Проверка ngrok
echo ""
echo -e "${BLUE}📝 Шаг 3: Проверка ngrok...${NC}"
if curl -s "$NGROK_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ngrok туннель работает${NC}"
    echo -e "   URL: ${BLUE}$NGROK_URL${NC}"
else
    echo -e "${RED}❌ ngrok туннель не доступен!${NC}"
    echo -e "${YELLOW}   Запустите ngrok вручную:${NC}"
    echo -e "   ${BLUE}ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001${NC}"
    echo ""
    echo -e "${YELLOW}   Или если у вас другая команда для постоянного домена...${NC}"
fi

# Информация о боте
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Система запущена!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN backend/.env | cut -d '=' -f2 | tr -d '"')
BOT_USERNAME=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe" | grep -o '"username":"[^"]*"' | cut -d':' -f2 | tr -d '"')

echo -e "${YELLOW}📱 Telegram Bot:${NC}"
echo -e "   Bot: ${BLUE}@${BOT_USERNAME}${NC}"
echo -e "   Ссылка: ${BLUE}https://t.me/${BOT_USERNAME}${NC}"
echo ""
echo -e "${YELLOW}🔗 URLs:${NC}"
echo -e "   Webhook: ${BLUE}$NGROK_URL/webhook${NC}"
echo -e "   Web App: ${BLUE}$NGROK_URL/language${NC}"
echo -e "   Backend API: ${BLUE}http://localhost:3001${NC}"
echo -e "   Frontend: ${BLUE}http://localhost:3003${NC}"
echo ""
echo -e "${YELLOW}💡 Для тестирования:${NC}"
echo -e "   1. Откройте Telegram"
echo -e "   2. Найдите бота: ${BLUE}@${BOT_USERNAME}${NC}"
echo -e "   3. Отправьте команду: ${BLUE}/start${NC}"
echo -e "   4. Нажмите кнопку: ${BLUE}🚗 Заказать трансфер${NC}"
echo ""
echo -e "${YELLOW}📊 Проверка статуса:${NC}"
echo -e "   ./check-bot-status.sh"
echo ""
echo -e "${YELLOW}🛑 Для остановки:${NC}"
echo -e "   Нажмите Ctrl+C или выполните: ${BLUE}pkill -f 'node.*(backend|frontend)'${NC}"
echo ""

