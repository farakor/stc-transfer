#!/bin/bash

# Скрипт для применения миграции добавления статуса VEHICLE_ASSIGNED
# Использование: ./apply-vehicle-assigned-migration.sh

echo "🔄 Применение миграции для добавления статуса VEHICLE_ASSIGNED..."

cd backend

# Применяем миграцию
echo "📦 Применяем миграцию базы данных..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Миграция успешно применена!"
    
    echo "📊 Проверяем статус миграций..."
    npx prisma migrate status
    
    echo ""
    echo "🔄 Перезапуск сервисов..."
    pm2 restart backend
    pm2 restart driver-bot
    
    echo ""
    echo "✅ Готово! Теперь авторизация водителей должна работать."
    echo ""
    echo "📝 Для проверки выполните:"
    echo "   pm2 logs driver-bot --lines 30"
else
    echo "❌ Ошибка при применении миграции"
    exit 1
fi

