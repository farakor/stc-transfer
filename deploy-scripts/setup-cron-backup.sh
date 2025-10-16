#!/bin/bash
# Скрипт настройки автоматического резервного копирования через cron

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

echo "⏰ Настройка автоматического резервного копирования..."
echo ""

# Запрос пароля базы данных
read -sp "Введите пароль базы данных PostgreSQL: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}✗ Пароль обязателен${NC}"
    exit 1
fi

# Путь к скрипту бэкапа
BACKUP_SCRIPT="$HOME/apps/stc-transfer/deploy-scripts/backup-db.sh"

if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo -e "${RED}✗ Скрипт бэкапа не найден: $BACKUP_SCRIPT${NC}"
    exit 1
fi

# Создание директории для логов бэкапа
mkdir -p "$HOME/backups"

# Время для бэкапа
print_info "Выберите время для автоматического бэкапа:"
echo "1) 02:00 (2:00 AM) - рекомендуется"
echo "2) 03:00 (3:00 AM)"
echo "3) 04:00 (4:00 AM)"
echo "4) Указать свое время"

read -p "Ваш выбор (1-4): " TIME_CHOICE

case $TIME_CHOICE in
    1)
        HOUR="2"
        MINUTE="0"
        ;;
    2)
        HOUR="3"
        MINUTE="0"
        ;;
    3)
        HOUR="4"
        MINUTE="0"
        ;;
    4)
        read -p "Введите час (0-23): " HOUR
        read -p "Введите минуту (0-59): " MINUTE
        ;;
    *)
        echo -e "${RED}✗ Неверный выбор${NC}"
        exit 1
        ;;
esac

# Создание cron задачи
CRON_JOB="$MINUTE $HOUR * * * export DB_PASSWORD='$DB_PASSWORD' && $BACKUP_SCRIPT >> $HOME/backups/backup.log 2>&1"

# Проверка существующих cron задач
if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
    print_warning "Cron задача для бэкапа уже существует"
    read -p "Заменить существующую задачу? (yes/no): " REPLACE
    
    if [ "$REPLACE" = "yes" ]; then
        # Удаляем старую задачу
        crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT" | crontab -
        print_info "Старая задача удалена"
    else
        print_info "Отменено"
        exit 0
    fi
fi

# Добавление новой cron задачи
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

print_success "Автоматический бэкап настроен!"
echo ""
echo "📅 Расписание: Ежедневно в $HOUR:$(printf "%02d" $MINUTE)"
echo "📁 Логи: $HOME/backups/backup.log"
echo "💾 Бэкапы: $HOME/backups/postgres/"
echo ""

# Показать текущие cron задачи
print_info "Текущие cron задачи:"
crontab -l

echo ""
print_success "✅ Настройка завершена!"
echo ""
echo "Для просмотра логов бэкапа:"
echo "  tail -f $HOME/backups/backup.log"
echo ""
echo "Для изменения расписания:"
echo "  crontab -e"
echo ""

