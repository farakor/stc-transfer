#!/bin/bash

# Скрипт для быстрой проверки подключения к Wialon

echo "🔍 Проверка подключения к Wialon сервера..."
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка доступности по домену
echo "1️⃣  Проверка домена gps.ent-en.com:"
if curl -s -m 5 http://gps.ent-en.com/wialon/ajax.html > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Домен доступен${NC}"
    DOMAIN_OK=true
else
    echo -e "${RED}❌ Домен недоступен (DNS не разрешается)${NC}"
    DOMAIN_OK=false
fi
echo ""

# Проверка доступности по IP
echo "2️⃣  Проверка IP адреса 176.74.220.111:"
if curl -s -m 5 http://176.74.220.111/wialon/ajax.html > /dev/null 2>&1; then
    echo -e "${GREEN}✅ IP адрес доступен и отвечает${NC}"
    IP_OK=true
    
    # Получаем детали ответа
    echo "   Детали подключения:"
    RESPONSE=$(curl -s -v http://176.74.220.111/wialon/ajax.html 2>&1)
    
    if echo "$RESPONSE" | grep -q "200 OK"; then
        echo -e "   ${GREEN}✅ HTTP статус: 200 OK${NC}"
    fi
    
    if echo "$RESPONSE" | grep -q "Content-Type"; then
        CONTENT_TYPE=$(echo "$RESPONSE" | grep "Content-Type" | cut -d' ' -f3-)
        echo -e "   ${GREEN}✅ Content-Type: ${CONTENT_TYPE}${NC}"
    fi
    
    if echo "$RESPONSE" | grep -q "Server:"; then
        SERVER=$(echo "$RESPONSE" | grep "Server:" | cut -d' ' -f3-)
        echo -e "   ${GREEN}✅ Server: ${SERVER}${NC}"
    fi
else
    echo -e "${RED}❌ IP адрес недоступен${NC}"
    IP_OK=false
fi
echo ""

# Проверка HTTPS
echo "3️⃣  Проверка HTTPS (176.74.220.111):"
if curl -s -k -m 5 https://176.74.220.111/wialon/ajax.html > /dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTPS доступен (с игнорированием SSL)${NC}"
    HTTPS_OK=true
else
    echo -e "${YELLOW}⚠️  HTTPS недоступен или требует принятия сертификата${NC}"
    HTTPS_OK=false
fi
echo ""

# Итоговая рекомендация
echo "📋 ИТОГ:"
echo "================================"

if [ "$IP_OK" = true ]; then
    echo -e "${GREEN}✅ Рекомендуется использовать: http://176.74.220.111/wialon${NC}"
    echo ""
    echo "Конфигурация уже обновлена в:"
    echo "  • frontend/src/config/wialon.config.ts"
    echo "  • backend/src/services/wialonService.ts"
    echo "  • backend/.env"
    echo ""
    echo "Перезапустите приложение:"
    echo "  cd frontend && npm run dev"
    echo "  cd backend && npm run dev"
elif [ "$HTTPS_OK" = true ]; then
    echo -e "${YELLOW}⚠️  HTTP недоступен, но HTTPS работает${NC}"
    echo ""
    echo "Выполните следующие действия:"
    echo "  1. Откройте https://176.74.220.111/wialon/ajax.html в браузере"
    echo "  2. Примите SSL сертификат (Advanced → Proceed)"
    echo "  3. Измените конфигурацию на HTTPS"
elif [ "$DOMAIN_OK" = true ]; then
    echo -e "${GREEN}✅ Домен работает, используйте: http://gps.ent-en.com/wialon${NC}"
else
    echo -e "${RED}❌ Сервер Wialon недоступен${NC}"
    echo ""
    echo "Возможные причины:"
    echo "  • Сервер временно не работает"
    echo "  • Проблемы с сетью"
    echo "  • Брандмауэр блокирует соединение"
    echo ""
    echo "Попробуйте:"
    echo "  • Проверить подключение к интернету"
    echo "  • Использовать VPN"
    echo "  • Обратиться к администратору сервера Wialon"
fi

echo "================================"
echo ""

# Проверка конфигурации
echo "4️⃣  Проверка текущей конфигурации:"

# Проверяем frontend конфигурацию
if [ -f "frontend/src/config/wialon.config.ts" ]; then
    FRONTEND_URL=$(grep "baseUrl:" frontend/src/config/wialon.config.ts | grep -v "//" | head -1 | cut -d"'" -f2)
    echo "   Frontend baseUrl: ${FRONTEND_URL}"
fi

# Проверяем backend .env
if [ -f "backend/.env" ]; then
    BACKEND_URL=$(grep "WIALON_BASE_URL" backend/.env | cut -d'"' -f2)
    echo "   Backend WIALON_BASE_URL: ${BACKEND_URL}"
fi

echo ""
echo "✅ Проверка завершена!"

