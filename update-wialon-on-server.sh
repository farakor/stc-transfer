#!/bin/bash

# Скрипт для обновления конфигурации Wialon на production сервере
# Использование: ./update-wialon-on-server.sh

echo "🚀 Обновление конфигурации Wialon на сервере..."
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Определяем корневую директорию проекта
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}📁 Рабочая директория: ${SCRIPT_DIR}${NC}"
echo ""

# Шаг 1: Обновление .env файла
echo -e "${YELLOW}1️⃣  Обновление backend/.env...${NC}"

if [ -f "backend/.env" ]; then
    # Создаем backup
    cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "   ${GREEN}✅ Создан backup: backend/.env.backup${NC}"
    
    # Обновляем WIALON_BASE_URL
    if grep -q "WIALON_BASE_URL=" backend/.env; then
        sed -i.tmp 's|WIALON_BASE_URL="https://gps.ent-en.com/wialon"|WIALON_BASE_URL="http://176.74.220.111/wialon"|g' backend/.env
        sed -i.tmp 's|WIALON_BASE_URL="http://gps.ent-en.com/wialon"|WIALON_BASE_URL="http://176.74.220.111/wialon"|g' backend/.env
        rm -f backend/.env.tmp
        echo -e "   ${GREEN}✅ WIALON_BASE_URL обновлен${NC}"
        
        # Показываем новое значение
        NEW_URL=$(grep "WIALON_BASE_URL=" backend/.env | cut -d'"' -f2)
        echo -e "   ${BLUE}📍 Новый URL: ${NEW_URL}${NC}"
    else
        echo -e "   ${RED}❌ WIALON_BASE_URL не найден в .env${NC}"
    fi
else
    echo -e "   ${RED}❌ Файл backend/.env не найден${NC}"
fi
echo ""

# Шаг 2: Проверка frontend конфигурации
echo -e "${YELLOW}2️⃣  Проверка frontend конфигурации...${NC}"

if [ -f "frontend/src/config/wialon.config.ts" ]; then
    FRONTEND_URL=$(grep "baseUrl:" frontend/src/config/wialon.config.ts | grep -v "//" | grep "176.74.220.111" | head -1)
    
    if [ -n "$FRONTEND_URL" ]; then
        echo -e "   ${GREEN}✅ Frontend использует IP адрес 176.74.220.111${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Frontend может использовать старый адрес${NC}"
        echo -e "   ${YELLOW}💡 Убедитесь что вы подтянули последние изменения из git${NC}"
    fi
else
    echo -e "   ${RED}❌ Файл конфигурации frontend не найден${NC}"
fi
echo ""

# Шаг 3: Сборка frontend
echo -e "${YELLOW}3️⃣  Сборка frontend...${NC}"

if [ -d "frontend" ]; then
    cd frontend
    
    echo -e "   ${BLUE}🔨 Запуск npm run build...${NC}"
    
    if npm run build > /tmp/build.log 2>&1; then
        echo -e "   ${GREEN}✅ Frontend успешно собран${NC}"
    else
        echo -e "   ${RED}❌ Ошибка при сборке frontend${NC}"
        echo -e "   ${YELLOW}Последние строки лога:${NC}"
        tail -10 /tmp/build.log
    fi
    
    cd ..
else
    echo -e "   ${RED}❌ Директория frontend не найдена${NC}"
fi
echo ""

# Шаг 4: Перезапуск сервисов
echo -e "${YELLOW}4️⃣  Перезапуск сервисов...${NC}"

# Проверяем какой менеджер процессов используется
if command -v pm2 &> /dev/null; then
    echo -e "   ${BLUE}🔄 Используется PM2${NC}"
    
    # Перезапускаем через PM2
    if pm2 restart ecosystem.config.js 2>&1 | grep -q "success"; then
        echo -e "   ${GREEN}✅ Сервисы перезапущены через PM2${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Попытка перезапустить все процессы PM2...${NC}"
        pm2 restart all
    fi
    
    echo ""
    echo -e "   ${BLUE}📊 Статус процессов:${NC}"
    pm2 list
    
elif [ -f "server-control.sh" ]; then
    echo -e "   ${BLUE}🔄 Используется server-control.sh${NC}"
    ./server-control.sh restart
    
else
    echo -e "   ${YELLOW}⚠️  Менеджер процессов не обнаружен${NC}"
    echo -e "   ${YELLOW}💡 Перезапустите backend и frontend вручную${NC}"
fi
echo ""

# Шаг 5: Перезапуск nginx (если есть)
echo -e "${YELLOW}5️⃣  Перезагрузка nginx...${NC}"

if command -v nginx &> /dev/null; then
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        sudo systemctl reload nginx
        echo -e "   ${GREEN}✅ Nginx перезагружен${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Конфигурация nginx имеет ошибки${NC}"
    fi
else
    echo -e "   ${BLUE}ℹ️  Nginx не установлен, пропускаем${NC}"
fi
echo ""

# Шаг 6: Проверка доступности Wialon
echo -e "${YELLOW}6️⃣  Проверка подключения к Wialon...${NC}"

if curl -s -m 5 http://176.74.220.111/wialon/ajax.html > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Сервер Wialon (176.74.220.111) доступен${NC}"
    
    # Проверяем детали
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://176.74.220.111/wialon/ajax.html)
    echo -e "   ${BLUE}📡 HTTP статус: ${HTTP_CODE}${NC}"
else
    echo -e "   ${RED}❌ Сервер Wialon недоступен с этого сервера${NC}"
    echo -e "   ${YELLOW}💡 Проверьте firewall и сетевые настройки${NC}"
fi
echo ""

# Итоговая информация
echo "================================"
echo -e "${GREEN}✅ Обновление завершено!${NC}"
echo "================================"
echo ""
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo "1. Проверьте логи backend: pm2 logs backend"
echo "2. Откройте админ панель и проверьте карту"
echo "3. Откройте консоль браузера (F12) для диагностики"
echo "4. Очистите кэш браузера (Ctrl+F5)"
echo ""
echo -e "${YELLOW}💡 Полезные команды:${NC}"
echo "• Логи backend:     pm2 logs backend"
echo "• Логи frontend:    pm2 logs frontend"
echo "• Статус процессов: pm2 status"
echo "• Перезапуск:       pm2 restart all"
echo ""
echo -e "${BLUE}📄 Документация: WIALON_DNS_FIX.md${NC}"
echo ""

