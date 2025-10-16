#!/bin/bash
# Скрипт резервного копирования базы данных

set -e

# Настройки
BACKUP_DIR="$HOME/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="stc_transfer"
DB_USER="stc_user"
RETENTION_DAYS=7

# Цвета
GREEN='\033[0;32m'
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

# Создание директории для бэкапов
mkdir -p $BACKUP_DIR

print_info "🗄️ Создание резервной копии базы данных..."

# Проверка наличия пароля в переменной окружения
if [ -z "$DB_PASSWORD" ]; then
    print_error "Переменная окружения DB_PASSWORD не установлена"
    echo "Установите её: export DB_PASSWORD='your_password'"
    exit 1
fi

# Создание бэкапа
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    print_success "Бэкап создан: backup_$TIMESTAMP.sql.gz ($BACKUP_SIZE)"
else
    print_error "Ошибка создания бэкапа"
    exit 1
fi

# Удаление старых бэкапов
print_info "Удаление бэкапов старше $RETENTION_DAYS дней..."
DELETED=$(find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
print_success "Удалено старых бэкапов: $DELETED"

# Список всех бэкапов
echo ""
print_info "📋 Список бэкапов:"
ls -lh $BACKUP_DIR/backup_*.sql.gz 2>/dev/null | tail -5 || echo "Нет бэкапов"

echo ""
print_success "✅ Резервное копирование завершено"

