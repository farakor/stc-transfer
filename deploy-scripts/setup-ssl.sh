#!/bin/bash
# Скрипт настройки SSL сертификата для домена

set -e

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

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

DOMAIN="srs.faruk.io"

echo "🔒 Настройка SSL сертификата для $DOMAIN..."
echo ""

# 1. Проверка DNS
print_info "Проверка DNS записи..."
SERVER_IP=$(dig +short $DOMAIN | tail -n1)

if [ -z "$SERVER_IP" ]; then
    print_error "DNS запись для $DOMAIN не найдена"
    echo "Убедитесь, что DNS запись указывает на IP этого сервера"
    exit 1
fi

print_success "DNS запись найдена: $DOMAIN -> $SERVER_IP"

# 2. Проверка Nginx конфигурации
print_info "Проверка конфигурации Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_success "Конфигурация Nginx корректна"
else
    print_error "Ошибка в конфигурации Nginx"
    exit 1
fi

# 3. Запрос email для Certbot
read -p "Введите email для уведомлений Let's Encrypt: " EMAIL

if [ -z "$EMAIL" ]; then
    print_error "Email обязателен"
    exit 1
fi

# 4. Получение SSL сертификата
print_info "Получение SSL сертификата..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

if [ $? -eq 0 ]; then
    print_success "SSL сертификат успешно установлен"
else
    print_error "Ошибка при получении SSL сертификата"
    exit 1
fi

# 5. Настройка автообновления
print_info "Настройка автообновления сертификата..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Тестирование обновления
sudo certbot renew --dry-run

if [ $? -eq 0 ]; then
    print_success "Автообновление сертификата настроено"
else
    print_error "Ошибка настройки автообновления"
fi

# 6. Перезагрузка Nginx
print_info "Перезагрузка Nginx..."
sudo systemctl reload nginx
print_success "Nginx перезагружен"

echo ""
print_success "🎉 SSL успешно настроен!"
echo ""
echo "Проверьте сайт: https://$DOMAIN"
echo "Проверьте безопасность: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""

