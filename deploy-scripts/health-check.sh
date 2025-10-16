#!/bin/bash
# Скрипт проверки здоровья приложения STC Transfer

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

DOMAIN="srs.faruk.io"
ERRORS=0

echo "🏥 Проверка здоровья STC Transfer..."
echo "=================================="
echo ""

# 1. Проверка PM2
print_info "Проверка PM2..."
if pm2 describe stc-backend > /dev/null 2>&1; then
    STATUS=$(pm2 jlist | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$STATUS" = "online" ]; then
        print_success "Backend работает (status: $STATUS)"
    else
        print_error "Backend не работает (status: $STATUS)"
        ((ERRORS++))
    fi
else
    print_error "Backend не найден в PM2"
    ((ERRORS++))
fi
echo ""

# 2. Проверка Nginx
print_info "Проверка Nginx..."
if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx работает"
else
    print_error "Nginx не работает"
    ((ERRORS++))
fi
echo ""

# 3. Проверка PostgreSQL
print_info "Проверка PostgreSQL..."
if sudo systemctl is-active --quiet postgresql; then
    print_success "PostgreSQL работает"
else
    print_error "PostgreSQL не работает"
    ((ERRORS++))
fi
echo ""

# 4. Проверка API Health Endpoint
print_info "Проверка API Health Endpoint..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/health)
if [ "$API_RESPONSE" = "200" ]; then
    print_success "API отвечает (HTTP $API_RESPONSE)"
else
    print_error "API не отвечает (HTTP $API_RESPONSE)"
    ((ERRORS++))
fi
echo ""

# 5. Проверка HTTPS
print_info "Проверка HTTPS..."
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
if [ "$HTTPS_RESPONSE" = "200" ]; then
    print_success "HTTPS работает (HTTP $HTTPS_RESPONSE)"
else
    print_warning "HTTPS вернул код: $HTTPS_RESPONSE"
fi
echo ""

# 6. Проверка SSL сертификата
print_info "Проверка SSL сертификата..."
SSL_EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates | grep "notAfter" | cut -d= -f2)
if [ -n "$SSL_EXPIRY" ]; then
    print_success "SSL сертификат валиден до: $SSL_EXPIRY"
else
    print_error "Не удалось проверить SSL сертификат"
    ((ERRORS++))
fi
echo ""

# 7. Проверка дискового пространства
print_info "Проверка дискового пространства..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    print_success "Использование диска: $DISK_USAGE%"
elif [ "$DISK_USAGE" -lt 90 ]; then
    print_warning "Использование диска: $DISK_USAGE% (приближается к лимиту)"
else
    print_error "Использование диска: $DISK_USAGE% (критический уровень)"
    ((ERRORS++))
fi
echo ""

# 8. Проверка памяти
print_info "Проверка памяти..."
MEMORY_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
if [ "$MEMORY_USAGE" -lt 80 ]; then
    print_success "Использование памяти: $MEMORY_USAGE%"
elif [ "$MEMORY_USAGE" -lt 90 ]; then
    print_warning "Использование памяти: $MEMORY_USAGE% (высокое)"
else
    print_error "Использование памяти: $MEMORY_USAGE% (критический уровень)"
fi
echo ""

# 9. Проверка портов
print_info "Проверка портов..."
if sudo netstat -tulpn | grep -q ":3001.*LISTEN"; then
    print_success "Backend слушает порт 3001"
else
    print_error "Backend не слушает порт 3001"
    ((ERRORS++))
fi

if sudo netstat -tulpn | grep -q ":443.*LISTEN"; then
    print_success "Nginx слушает порт 443 (HTTPS)"
else
    print_error "Nginx не слушает порт 443"
    ((ERRORS++))
fi
echo ""

# 10. Проверка логов на ошибки (последние 100 строк)
print_info "Проверка логов на критические ошибки..."
RECENT_ERRORS=$(pm2 logs stc-backend --lines 100 --nostream 2>/dev/null | grep -i "error\|fatal\|critical" | wc -l)
if [ "$RECENT_ERRORS" -eq 0 ]; then
    print_success "Критические ошибки не найдены"
elif [ "$RECENT_ERRORS" -lt 5 ]; then
    print_warning "Найдено $RECENT_ERRORS ошибок в логах"
else
    print_error "Найдено $RECENT_ERRORS ошибок в логах (проверьте: pm2 logs)"
fi
echo ""

# 11. Проверка последнего бэкапа
print_info "Проверка резервных копий..."
BACKUP_DIR="$HOME/backups/postgres"
if [ -d "$BACKUP_DIR" ]; then
    LAST_BACKUP=$(find $BACKUP_DIR -name "backup_*.sql.gz" -type f -mtime -2 | wc -l)
    if [ "$LAST_BACKUP" -gt 0 ]; then
        LAST_BACKUP_FILE=$(ls -t $BACKUP_DIR/backup_*.sql.gz 2>/dev/null | head -1)
        LAST_BACKUP_DATE=$(stat -c %y "$LAST_BACKUP_FILE" 2>/dev/null | cut -d' ' -f1)
        print_success "Последний бэкап: $LAST_BACKUP_DATE"
    else
        print_warning "Нет свежих бэкапов (старше 2 дней)"
    fi
else
    print_warning "Директория бэкапов не найдена"
fi
echo ""

# Итоговая статистика
echo "=================================="
echo "📊 Статистика системы:"
echo ""

# CPU Load
LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')
echo "CPU Load: $LOAD"

# Memory
MEM_TOTAL=$(free -h | awk 'NR==2 {print $2}')
MEM_USED=$(free -h | awk 'NR==2 {print $3}')
echo "Memory: $MEM_USED / $MEM_TOTAL"

# Disk
DISK_TOTAL=$(df -h / | awk 'NR==2 {print $2}')
DISK_USED=$(df -h / | awk 'NR==2 {print $3}')
echo "Disk: $DISK_USED / $DISK_TOTAL"

# Uptime
UPTIME=$(uptime -p)
echo "Uptime: $UPTIME"

echo ""
echo "=================================="

# Финальный результат
if [ $ERRORS -eq 0 ]; then
    echo ""
    print_success "🎉 Все проверки пройдены успешно!"
    echo ""
    exit 0
else
    echo ""
    print_error "⚠️ Обнаружено $ERRORS проблем(ы)"
    echo ""
    echo "Для детальной диагностики:"
    echo "  pm2 logs stc-backend --lines 100"
    echo "  sudo tail -f /var/log/nginx/stc-error.log"
    echo "  sudo systemctl status nginx"
    echo "  sudo systemctl status postgresql"
    echo ""
    exit 1
fi

