#!/bin/bash

# Скрипт запуска Telegram Bot для STC Transfer
# Использование: ./start-telegram-bot.sh

echo "🚀 Запуск STC Transfer Telegram Bot"
echo "===================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка наличия .env файла
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Файл backend/.env не найден!${NC}"
    echo "Создайте файл из backend/env.example"
    exit 1
fi

# Проверка ngrok
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok не установлен!${NC}"
    echo "Установите ngrok: brew install ngrok"
    exit 1
fi

echo -e "${BLUE}📝 Шаг 1: Проверка конфигурации...${NC}"

# Используем постоянную ngrok ссылку
NGROK_URL="https://finer-legal-hedgehog.ngrok-free.app"

echo -e "${GREEN}✅ Постоянный ngrok URL: $NGROK_URL${NC}"

# Проверяем, что URL правильный в .env
echo -e "${BLUE}📝 Шаг 2: Проверка webhook URL в .env...${NC}"
CURRENT_WEBHOOK=$(grep TELEGRAM_WEBHOOK_URL backend/.env | cut -d '=' -f2 | tr -d '"')

if [ "$CURRENT_WEBHOOK" != "$NGROK_URL" ]; then
    echo -e "${YELLOW}⚠️  Обновление URL на постоянный...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|TELEGRAM_WEBHOOK_URL=.*|TELEGRAM_WEBHOOK_URL=\"$NGROK_URL\"|g" backend/.env
        sed -i '' "s|TELEGRAM_WEBAPP_URL=.*|TELEGRAM_WEBAPP_URL=\"$NGROK_URL/language\"|g" backend/.env
    else
        # Linux
        sed -i "s|TELEGRAM_WEBHOOK_URL=.*|TELEGRAM_WEBHOOK_URL=\"$NGROK_URL\"|g" backend/.env
        sed -i "s|TELEGRAM_WEBAPP_URL=.*|TELEGRAM_WEBAPP_URL=\"$NGROK_URL/language\"|g" backend/.env
    fi
    echo -e "${GREEN}✅ URL обновлен на постоянный${NC}"
else
    echo -e "${GREEN}✅ URL уже правильный${NC}"
fi

# Проверяем доступность ngrok туннеля
echo -e "${BLUE}📝 Шаг 3: Проверка ngrok туннеля...${NC}"
if curl -s "$NGROK_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ngrok туннель работает${NC}"
else
    echo -e "${YELLOW}⚠️  ngrok туннель не доступен${NC}"
    echo -e "${YELLOW}   Запустите ngrok с постоянным доменом:${NC}"
    echo -e "${BLUE}   ngrok http --domain=finer-legal-hedgehog.ngrok-free.app 3001${NC}"
    echo ""
fi

# Запуск backend
echo -e "${BLUE}📝 Шаг 4: Запуск backend сервера...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend запущен (PID: $BACKEND_PID)${NC}"

# Ждем запуска сервера
sleep 5

# Проверяем статус
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Система запущена успешно!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📱 Telegram Bot:${NC}"
BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN backend/.env | cut -d '=' -f2 | tr -d '"')
BOT_USERNAME=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe" | grep -o '"username":"[^"]*"' | cut -d':' -f2 | tr -d '"')
echo -e "   Bot: ${BLUE}@${BOT_USERNAME}${NC}"
echo -e "   Ссылка: ${BLUE}https://t.me/${BOT_USERNAME}${NC}"
echo ""
echo -e "${YELLOW}🔗 URLs:${NC}"
echo -e "   Webhook: ${BLUE}$NGROK_URL/webhook${NC}"
echo -e "   Backend: ${BLUE}http://localhost:3001${NC}"
echo -e "   ngrok Dashboard: ${BLUE}http://localhost:4040${NC}"
echo ""
echo -e "${YELLOW}💡 Для тестирования:${NC}"
echo -e "   1. Откройте Telegram"
echo -e "   2. Найдите бота: ${BLUE}@${BOT_USERNAME}${NC}"
echo -e "   3. Отправьте команду: ${BLUE}/start${NC}"
echo ""
echo -e "${RED}❌ Для остановки нажмите Ctrl+C${NC}"
echo ""

# Функция очистки при выходе
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Остановка сервисов...${NC}"
    kill $NGROK_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Сервисы остановлены${NC}"
    exit 0
}

# Установка обработчика сигналов
trap cleanup SIGINT SIGTERM

# Ожидание
wait $BACKEND_PID

