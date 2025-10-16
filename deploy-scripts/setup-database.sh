#!/bin/bash
# Скрипт создания базы данных PostgreSQL

set -e

echo "🐘 Настройка базы данных PostgreSQL..."

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Запрос параметров
read -p "Введите имя пользователя БД [stc_user]: " DB_USER
DB_USER=${DB_USER:-stc_user}

read -sp "Введите пароль для пользователя БД: " DB_PASSWORD
echo ""

read -p "Введите имя базы данных [stc_transfer]: " DB_NAME
DB_NAME=${DB_NAME:-stc_transfer}

# Создание пользователя и базы данных
echo "Создание пользователя и базы данных..."
sudo -u postgres psql <<EOF
-- Создание пользователя
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Создание базы данных
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Выдача прав
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

print_success "База данных создана"

# Тестирование подключения
echo "Тестирование подключения..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "Подключение успешно"
else
    print_error "Ошибка подключения к базе данных"
    exit 1
fi

echo ""
echo "📝 Сохраните эту строку подключения для .env файла:"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME\""
echo ""

