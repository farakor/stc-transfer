#!/bin/bash

# Скрипт детальной диагностики проблемы с Wialon на сервере
# Запуск: ./diagnose-wialon-server.sh

echo "🔍 ДИАГНОСТИКА ПРОБЛЕМЫ WIALON НА СЕРВЕРЕ"
echo "=========================================="
echo ""

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Проверка .env
echo -e "${BLUE}1️⃣  Проверка backend/.env:${NC}"
if [ -f "backend/.env" ]; then
    echo "WIALON_BASE_URL:"
    grep "WIALON_BASE_URL" backend/.env || echo -e "${RED}❌ Не найдено${NC}"
    echo ""
    echo "WIALON_TOKEN (первые 20 символов):"
    grep "WIALON_TOKEN" backend/.env | cut -c1-40 || echo -e "${RED}❌ Не найдено${NC}"
else
    echo -e "${RED}❌ Файл backend/.env не найден!${NC}"
fi
echo ""

# 2. Проверка frontend конфигурации
echo -e "${BLUE}2️⃣  Проверка frontend/src/config/wialon.config.ts:${NC}"
if [ -f "frontend/src/config/wialon.config.ts" ]; then
    echo "Активная конфигурация (baseUrl):"
    grep "baseUrl:" frontend/src/config/wialon.config.ts | grep -v "//" | head -3
else
    echo -e "${RED}❌ Файл не найден!${NC}"
fi
echo ""

# 3. Проверка собранного frontend
echo -e "${BLUE}3️⃣  Проверка собранного frontend:${NC}"
if [ -d "frontend/dist" ]; then
    echo -e "${GREEN}✅ Директория frontend/dist существует${NC}"
    echo "Последнее изменение:"
    ls -lhd frontend/dist | awk '{print $6, $7, $8}'
    echo ""
    
    # Проверяем содержимое конфига в собранном файле
    echo "Проверка wialon.config в собранных файлах:"
    if grep -r "176.74.220.111" frontend/dist/ 2>/dev/null | head -2; then
        echo -e "${GREEN}✅ IP адрес 176.74.220.111 найден в собранных файлах${NC}"
    else
        echo -e "${RED}❌ IP адрес НЕ найден в собранных файлах!${NC}"
        echo -e "${YELLOW}⚠️  Frontend НЕ ПЕРЕСОБРАН или собран со старой конфигурацией!${NC}"
    fi
    
    if grep -r "gps.ent-en.com" frontend/dist/ 2>/dev/null | head -2; then
        echo -e "${RED}❌ Старый домен gps.ent-en.com все еще в собранных файлах!${NC}"
        echo -e "${YELLOW}⚠️  НУЖНО ПЕРЕСОБРАТЬ FRONTEND!${NC}"
    fi
else
    echo -e "${RED}❌ Директория frontend/dist не найдена! Frontend не собран!${NC}"
fi
echo ""

# 4. Проверка доступности Wialon с сервера
echo -e "${BLUE}4️⃣  Проверка доступности Wialon с ЭТОГО сервера:${NC}"
echo "Пробуем подключиться к 176.74.220.111..."
if timeout 5 curl -s http://176.74.220.111/wialon/ajax.html > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Сервер 176.74.220.111 ДОСТУПЕН с этого сервера${NC}"
    
    # Получаем HTTP статус
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://176.74.220.111/wialon/ajax.html)
    echo "HTTP статус: ${HTTP_CODE}"
else
    echo -e "${RED}❌ Сервер 176.74.220.111 НЕДОСТУПЕН с этого сервера!${NC}"
    echo -e "${YELLOW}⚠️  Проблема с сетью или firewall!${NC}"
    echo ""
    echo "Попробуйте вручную:"
    echo "  curl -v http://176.74.220.111/wialon/ajax.html"
fi
echo ""

# 5. Проверка запущенных процессов
echo -e "${BLUE}5️⃣  Проверка запущенных процессов:${NC}"
if command -v pm2 &> /dev/null; then
    pm2 list | grep -E "name|backend|frontend" | head -10
    echo ""
    echo "Время последнего рестарта:"
    pm2 list | grep -E "backend|frontend" | awk '{print $2, $14, $15, $16}'
else
    echo -e "${YELLOW}⚠️  PM2 не установлен${NC}"
    echo "Проверьте процессы вручную: ps aux | grep node"
fi
echo ""

# 6. Проверка логов backend
echo -e "${BLUE}6️⃣  Проверка логов backend (последние 10 строк с 'wialon'):${NC}"
if command -v pm2 &> /dev/null; then
    pm2 logs backend --lines 50 --nostream 2>/dev/null | grep -i wialon | tail -10 || echo "Нет упоминаний wialon в логах"
elif [ -f "logs/backend.log" ]; then
    tail -50 logs/backend.log | grep -i wialon | tail -10 || echo "Нет упоминаний wialon в логах"
else
    echo -e "${YELLOW}⚠️  Логи не найдены${NC}"
fi
echo ""

# 7. Проверка Mixed Content (HTTP vs HTTPS)
echo -e "${BLUE}7️⃣  Проверка HTTP/HTTPS конфигурации:${NC}"
if [ -f "frontend/.env" ] || [ -f "frontend/.env.production" ]; then
    echo "Frontend .env файлы:"
    ls -la frontend/.env* 2>/dev/null || echo "Нет .env файлов в frontend"
    echo ""
fi

# Проверяем nginx конфигурацию
if [ -f "/etc/nginx/sites-available/stc-transfer" ] || [ -f "/etc/nginx/sites-enabled/stc-transfer" ]; then
    echo "Nginx конфигурация (SSL):"
    grep -E "listen.*443|ssl_certificate" /etc/nginx/sites-*/stc-transfer 2>/dev/null | head -5
    echo ""
    
    if grep -q "listen.*443" /etc/nginx/sites-*/stc-transfer 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Frontend работает на HTTPS${NC}"
        echo -e "${YELLOW}⚠️  Браузер может блокировать HTTP запросы к Wialon (Mixed Content)${NC}"
        echo -e "${YELLOW}💡 Решение: используйте HTTPS для Wialon или прокси${NC}"
    fi
fi
echo ""

# 8. Проверка переменных окружения процесса
echo -e "${BLUE}8️⃣  Проверка переменных окружения backend процесса:${NC}"
if command -v pm2 &> /dev/null; then
    echo "PM2 env для backend:"
    pm2 env 0 2>/dev/null | grep -i wialon || echo "PM2 env не доступен"
fi
echo ""

# 9. Проверка времени изменения файлов
echo -e "${BLUE}9️⃣  Временные метки важных файлов:${NC}"
echo "backend/.env:"
ls -lh backend/.env 2>/dev/null | awk '{print $6, $7, $8}' || echo "Не найдено"
echo "frontend/dist:"
ls -lhd frontend/dist 2>/dev/null | awk '{print $6, $7, $8}' || echo "Не найдено"
echo "frontend/src/config/wialon.config.ts:"
ls -lh frontend/src/config/wialon.config.ts 2>/dev/null | awk '{print $6, $7, $8}' || echo "Не найдено"
echo ""

# 10. Итоги и рекомендации
echo "=========================================="
echo -e "${YELLOW}📋 РЕКОМЕНДАЦИИ:${NC}"
echo ""

# Проверяем что не так
ISSUES=0

# Проверка 1: Frontend не пересобран
if grep -r "gps.ent-en.com" frontend/dist/ 2>/dev/null | grep -q "gps.ent-en.com"; then
    ISSUES=$((ISSUES+1))
    echo -e "${RED}❌ ПРОБЛЕМА $ISSUES: Frontend собран со старой конфигурацией${NC}"
    echo -e "${GREEN}   Решение:${NC}"
    echo "   cd frontend"
    echo "   rm -rf dist .vite node_modules/.vite"
    echo "   npm run build"
    echo "   cd .."
    echo ""
fi

# Проверка 2: Wialon недоступен
if ! timeout 5 curl -s http://176.74.220.111/wialon/ajax.html > /dev/null 2>&1; then
    ISSUES=$((ISSUES+1))
    echo -e "${RED}❌ ПРОБЛЕМА $ISSUES: Wialon сервер недоступен с этого сервера${NC}"
    echo -e "${GREEN}   Решение:${NC}"
    echo "   1. Проверьте firewall: sudo ufw status"
    echo "   2. Проверьте сеть: ping 176.74.220.111"
    echo "   3. Используйте прокси-сервер"
    echo ""
fi

# Проверка 3: Mixed Content
if grep -q "listen.*443" /etc/nginx/sites-*/stc-transfer 2>/dev/null; then
    ISSUES=$((ISSUES+1))
    echo -e "${RED}❌ ПРОБЛЕМА $ISSUES: Mixed Content (HTTPS -> HTTP блокировка)${NC}"
    echo -e "${GREEN}   Решение:${NC}"
    echo "   ВАРИАНТ 1: Используйте HTTPS для Wialon"
    echo "   sed -i 's|http://176.74.220.111|https://176.74.220.111|g' backend/.env"
    echo "   sed -i 's|http://176.74.220.111|https://176.74.220.111|g' frontend/src/config/wialon.config.ts"
    echo ""
    echo "   ВАРИАНТ 2: Используйте прокси-сервер (рекомендуется)"
    echo "   node wialon-proxy-server.js &"
    echo "   sed -i 's|176.74.220.111/wialon|localhost:3005/wialon|g' backend/.env"
    echo ""
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ Видимых проблем не обнаружено${NC}"
    echo ""
    echo "Дополнительные шаги:"
    echo "1. Очистите кэш браузера (Ctrl+F5)"
    echo "2. Проверьте консоль браузера (F12)"
    echo "3. Проверьте логи: pm2 logs backend"
fi

echo ""
echo "=========================================="
echo -e "${BLUE}🔧 БЫСТРЫЕ КОМАНДЫ ДЛЯ ИСПРАВЛЕНИЯ:${NC}"
echo ""
echo "# Полная пересборка frontend:"
echo "cd frontend && rm -rf dist .vite && npm run build && cd .."
echo ""
echo "# Перезапуск с очисткой:"
echo "pm2 delete all && pm2 start ecosystem.config.js"
echo ""
echo "# Проверка доступности Wialon:"
echo "curl -v http://176.74.220.111/wialon/ajax.html"
echo ""

