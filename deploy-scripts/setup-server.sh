#!/bin/bash
# Скрипт автоматической настройки сервера Ubuntu 24 для STC Transfer
# Запускать от имени пользователя с sudo правами

set -e  # Остановить при ошибке

echo "🚀 Начало настройки сервера для STC Transfer..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Обновление системы
echo "📦 Обновление системы..."
sudo apt update && sudo apt upgrade -y
print_success "Система обновлена"

# 2. Установка базовых утилит
echo "🔧 Установка базовых утилит..."
sudo apt install -y curl wget git build-essential
print_success "Базовые утилиты установлены"

# 3. Установка Node.js 20.x
echo "📦 Установка Node.js 20.x..."
if command -v node &> /dev/null; then
    print_warning "Node.js уже установлен: $(node -v)"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js установлен: $(node -v)"
fi

# 4. Установка PostgreSQL
echo "🐘 Установка PostgreSQL..."
if command -v psql &> /dev/null; then
    print_warning "PostgreSQL уже установлен"
else
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_success "PostgreSQL установлен и запущен"
fi

# 5. Установка Nginx
echo "🌐 Установка Nginx..."
if command -v nginx &> /dev/null; then
    print_warning "Nginx уже установлен"
else
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_success "Nginx установлен и запущен"
fi

# 6. Установка PM2
echo "⚙️ Установка PM2..."
if command -v pm2 &> /dev/null; then
    print_warning "PM2 уже установлен: $(pm2 -v)"
else
    sudo npm install -g pm2
    print_success "PM2 установлен: $(pm2 -v)"
fi

# 7. Установка Certbot
echo "🔒 Установка Certbot для SSL..."
if command -v certbot &> /dev/null; then
    print_warning "Certbot уже установлен"
else
    sudo apt install -y certbot python3-certbot-nginx
    print_success "Certbot установлен"
fi

# 8. Настройка firewall
echo "🔥 Настройка firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
print_success "Firewall настроен"

# 9. Создание директории для приложения
echo "📁 Создание директории для приложения..."
mkdir -p ~/apps
mkdir -p ~/backups
print_success "Директории созданы"

echo ""
print_success "🎉 Сервер успешно настроен!"
echo ""
echo "Следующие шаги:"
echo "1. Создайте базу данных PostgreSQL"
echo "2. Клонируйте репозиторий в ~/apps/"
echo "3. Настройте .env файлы"
echo "4. Соберите и запустите приложение"
echo ""

