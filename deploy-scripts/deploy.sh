#!/bin/bash
# Скрипт развертывания/обновления приложения STC Transfer

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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Определение директории проекта
PROJECT_DIR="$HOME/apps/stc-transfer"

if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Директория проекта не найдена: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

echo "🚀 Начало развертывания STC Transfer..."
echo ""

# 1. Git pull (если используется Git)
if [ -d ".git" ]; then
    print_info "Получение последних изменений из Git..."
    git pull origin main || print_warning "Не удалось получить изменения из Git"
    print_success "Изменения получены"
fi

# 2. Backend
echo ""
print_info "📦 Обновление Backend..."
cd "$PROJECT_DIR/backend"

# Установка зависимостей
print_info "Установка зависимостей..."
npm install --production=false

# Генерация Prisma Client
print_info "Генерация Prisma Client..."
npm run db:generate

# Применение миграций
print_info "Применение миграций базы данных..."
npx prisma migrate deploy || print_warning "Миграции не применены (возможно, нет новых)"

# Сборка
print_info "Сборка Backend..."
npm run build

print_success "Backend обновлен"

# 3. Frontend
echo ""
print_info "🎨 Обновление Frontend..."
cd "$PROJECT_DIR/frontend"

# Установка зависимостей
print_info "Установка зависимостей..."
npm install

# Сборка
print_info "Сборка Frontend..."
npm run build

print_success "Frontend обновлен"

# 4. Перезапуск Backend через PM2
echo ""
print_info "♻️ Перезапуск Backend..."
cd "$PROJECT_DIR"

if pm2 describe stc-backend > /dev/null 2>&1; then
    pm2 restart stc-backend
    print_success "Backend перезапущен"
else
    print_warning "Backend не запущен в PM2, запускаем..."
    pm2 start ecosystem.config.js
    pm2 save
    print_success "Backend запущен"
fi

# 5. Проверка статуса
echo ""
print_info "📊 Статус приложения:"
pm2 status

# 6. Проверка здоровья
echo ""
print_info "🏥 Проверка здоровья приложения..."
sleep 3  # Ждем, пока приложение запустится

if curl -f https://srs.faruk.io/api/health > /dev/null 2>&1; then
    print_success "API отвечает корректно"
else
    print_warning "API не отвечает. Проверьте логи: pm2 logs stc-backend"
fi

echo ""
print_success "🎉 Развертывание завершено!"
echo ""
echo "Полезные команды:"
echo "  pm2 logs stc-backend    - Просмотр логов"
echo "  pm2 monit               - Мониторинг в реальном времени"
echo "  pm2 restart stc-backend - Перезапуск приложения"
echo ""

