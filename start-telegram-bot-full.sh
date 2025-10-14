#!/bin/bash

# Скрипт запуска Telegram Bot с Frontend для STC Transfer
# Использование: ./start-telegram-bot-full.sh

echo "🚀 Запуск STC Transfer Telegram Bot + Frontend"
echo "=============================================="
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

echo -e "${BLUE}📝 Шаг 1: Запуск ngrok для Backend (порт 3001)...${NC}"
ngrok http 3001 > /dev/null &
NGROK_BACKEND_PID=$!
echo -e "${GREEN}✅ ngrok для Backend запущен (PID: $NGROK_BACKEND_PID)${NC}"

sleep 2

echo -e "${BLUE}📝 Шаг 2: Запуск ngrok для Frontend (порт 3003)...${NC}"
ngrok http 3003 > /dev/null &
NGROK_FRONTEND_PID=$!
echo -e "${GREEN}✅ ngrok для Frontend запущен (PID: $NGROK_FRONTEND_PID)${NC}"

# Ждем запуска обоих ngrok
sleep 3

# Получаем публичные URL от ngrok
echo -e "${BLUE}📝 Шаг 3: Получение публичных URL...${NC}"

# Получаем все туннели
NGROK_JSON=$(curl -s http://localhost:4040/api/tunnels)

# Парсим URLs для каждого порта
BACKEND_URL=$(echo $NGROK_JSON | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)
FRONTEND_URL=$(echo $NGROK_JSON | grep -o 'https://[^"]*\.ngrok-free\.app' | tail -1)

if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Не удалось получить URL от ngrok!${NC}"
    kill $NGROK_BACKEND_PID $NGROK_FRONTEND_PID
    exit 1
fi

echo -e "${GREEN}✅ Backend URL: $BACKEND_URL${NC}"
echo -e "${GREEN}✅ Frontend URL: $FRONTEND_URL${NC}"

# Обновляем .env файл
echo -e "${BLUE}📝 Шаг 4: Обновление конфигурации...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|TELEGRAM_WEBHOOK_URL=.*|TELEGRAM_WEBHOOK_URL=\"$BACKEND_URL\"|g" backend/.env
    sed -i '' "s|TELEGRAM_WEBAPP_URL=.*|TELEGRAM_WEBAPP_URL=\"$FRONTEND_URL/language\"|g" backend/.env
else
    # Linux
    sed -i "s|TELEGRAM_WEBHOOK_URL=.*|TELEGRAM_WEBHOOK_URL=\"$BACKEND_URL\"|g" backend/.env
    sed -i "s|TELEGRAM_WEBAPP_URL=.*|TELEGRAM_WEBAPP_URL=\"$FRONTEND_URL/language\"|g" backend/.env
fi
echo -e "${GREEN}✅ Конфигурация обновлена${NC}"

# Запуск frontend
echo -e "${BLUE}📝 Шаг 5: Запуск Frontend сервера...${NC}"
cd frontend
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✅ Frontend запущен (PID: $FRONTEND_PID)${NC}"

sleep 3

# Запуск backend
echo -e "${BLUE}📝 Шаг 6: Запуск Backend сервера...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✅ Backend запущен (PID: $BACKEND_PID)${NC}"

# Ждем запуска серверов
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
echo -e "   Backend API: ${BLUE}$BACKEND_URL${NC}"
echo -e "   Frontend App: ${BLUE}$FRONTEND_URL${NC}"
echo -e "   Webhook: ${BLUE}$BACKEND_URL/webhook${NC}"
echo -e "   Web App: ${BLUE}$FRONTEND_URL/language${NC}"
echo -e "   ngrok Dashboard: ${BLUE}http://localhost:4040${NC}"
echo ""
echo -e "${YELLOW}🖥️  Локальные адреса:${NC}"
echo -e "   Backend: ${BLUE}http://localhost:3001${NC}"
echo -e "   Frontend: ${BLUE}http://localhost:3003${NC}"
echo ""
echo -e "${YELLOW}💡 Для тестирования:${NC}"
echo -e "   1. Откройте Telegram"
echo -e "   2. Найдите бота: ${BLUE}@${BOT_USERNAME}${NC}"
echo -e "   3. Отправьте команду: ${BLUE}/start${NC}"
echo -e "   4. Нажмите кнопку: ${BLUE}🚗 Заказать трансфер${NC}"
echo ""
echo -e "${RED}❌ Для остановки нажмите Ctrl+C${NC}"
echo ""

# Функция очистки при выходе
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Остановка сервисов...${NC}"
    kill $NGROK_BACKEND_PID 2>/dev/null
    kill $NGROK_FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Сервисы остановлены${NC}"
    exit 0
}

# Установка обработчика сигналов
trap cleanup SIGINT SIGTERM

# Ожидание
wait $BACKEND_PID

