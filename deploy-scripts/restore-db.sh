#!/bin/bash
# Скрипт восстановления базы данных из резервной копии

set -e

# Настройки
BACKUP_DIR="$HOME/backups/postgres"
DB_NAME="stc_transfer"
DB_USER="stc_user"

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

print_warning "⚠️ ВНИМАНИЕ! Это действие удалит текущую базу данных!"

# Проверка наличия пароля
if [ -z "$DB_PASSWORD" ]; then
    print_error "Переменная окружения DB_PASSWORD не установлена"
    echo "Установите её: export DB_PASSWORD='your_password'"
    exit 1
fi

# Список доступных бэкапов
echo ""
print_info "📋 Доступные бэкапы:"
ls -lh $BACKUP_DIR/backup_*.sql.gz 2>/dev/null | nl

# Выбор бэкапа
echo ""
read -p "Введите имя файла бэкапа для восстановления: " BACKUP_FILE

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    print_error "Файл не найден: $BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

# Подтверждение
echo ""
print_warning "Вы собираетесь восстановить базу данных из: $BACKUP_FILE"
read -p "Продолжить? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_info "Отменено"
    exit 0
fi

# Остановка приложения
print_info "Остановка приложения..."
pm2 stop stc-backend || true

# Восстановление
print_info "🔄 Восстановление базы данных..."

# Удаление текущей базы данных
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d postgres <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME OWNER $DB_USER;
EOF

# Восстановление из бэкапа
gunzip -c "$BACKUP_DIR/$BACKUP_FILE" | PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost $DB_NAME

if [ $? -eq 0 ]; then
    print_success "База данных восстановлена"
else
    print_error "Ошибка восстановления базы данных"
    exit 1
fi

# Запуск приложения
print_info "Запуск приложения..."
pm2 start stc-backend

echo ""
print_success "✅ Восстановление завершено"

