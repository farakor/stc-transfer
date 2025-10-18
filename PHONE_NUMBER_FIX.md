# Исправление проблемы с аутентификацией водителей

## Проблема 1: Разные форматы номеров телефонов

При попытке войти как водитель через бот водителя появлялась ошибка:
```
❌ Водитель с таким номером телефона не найден в системе.
```

Это происходило из-за разных форматов номеров телефонов:
- В админ панели: `+998 97-703-79-42` (с дефисами)
- В боте: `+998 97 703 79 42` (с пробелами)

### Решение
Изменена логика поиска водителей по номеру телефона для сравнения только цифр.

## Проблема 2: Отсутствует значение VEHICLE_ASSIGNED в enum

После исправления первой проблемы появилась ошибка:
```
invalid input value for enum "BookingStatus": "VEHICLE_ASSIGNED"
```

Это происходит потому, что в схеме Prisma есть значение `VEHICLE_ASSIGNED`, но в базе данных PostgreSQL на сервере этого значения нет.

### Решение
Создана миграция для добавления значения `VEHICLE_ASSIGNED` в enum `BookingStatus`.

## Деплой на сервер - ПОЛНАЯ ИНСТРУКЦИЯ

### Шаг 1: Подключение к серверу
```bash
ssh stc@skdss-transport
```

### Шаг 2: Переход в директорию проекта
```bash
cd ~/apps/stc-transfer
```

### Шаг 3: Сохранение локальных изменений
```bash
# Сбрасываем локальные изменения в package-lock.json (они не важны)
git checkout -- backend/package-lock.json

# Или сохраняем все локальные изменения
# git stash
```

### Шаг 4: Получение обновлений
```bash
git pull origin main
```

### Шаг 5: Применение миграции базы данных
```bash
cd backend
npx prisma migrate deploy
```

Эта команда применит новую миграцию, которая добавит значение `VEHICLE_ASSIGNED` в enum `BookingStatus`.

### Шаг 6: Установка зависимостей
```bash
npm install
```

### Шаг 7: Компиляция
```bash
npm run build
```

### Шаг 8: Перезапуск сервисов
```bash
pm2 restart backend
pm2 restart driver-bot
```

### Шаг 9: Проверка статуса
```bash
pm2 status
pm2 logs driver-bot --lines 50
```

## Альтернативный способ - Автоматический скрипт

Вы можете использовать автоматический скрипт для применения миграции:

```bash
cd ~/apps/stc-transfer
./apply-vehicle-assigned-migration.sh
```

## Измененные файлы

1. **backend/src/services/driverTelegramBot.ts** - исправлен поиск водителя по номеру
2. **backend/src/controllers/driverController.ts** - исправлен поиск водителя по номеру
3. **backend/prisma/migrations/20251018000000_add_vehicle_assigned_status/migration.sql** - новая миграция

## Тестирование

1. Откройте бот водителя в Telegram
2. Нажмите `/start`
3. Поделитесь своим номером телефона
4. Должно появиться сообщение: `✅ Спасибо! Ваш номер телефона подтвержден.`
5. Попробуйте открыть приложение водителя

## Проверка миграций

Чтобы проверить, какие миграции применены на сервере:

```bash
cd ~/apps/stc-transfer/backend
npx prisma migrate status
```

## Проверка enum в базе данных

Чтобы проверить, какие значения есть в enum BookingStatus:

```bash
# Подключитесь к PostgreSQL
psql -U stc_user -d stc_transfer

# Выполните запрос
SELECT unnest(enum_range(NULL::public."BookingStatus"));

# Должны увидеть:
# PENDING
# VEHICLE_ASSIGNED  <-- это новое значение
# CONFIRMED
# IN_PROGRESS
# COMPLETED
# CANCELLED

# Выход
\q
```

## Отладка

В логах теперь будут видны подробности поиска:

```
🔍 Поиск водителя по номеру телефона: {
  original: '+998977037942',
  clean: '998977037942',
  formatted: '+998977037942'
}
  Сравнение: +998 97-703-79-42 (998977037942) === +998977037942 (998977037942): true
✅ Водитель найден: Имя Водителя
```

## Откат изменений (если необходимо)

```bash
cd ~/apps/stc-transfer

# Откат кода
git checkout HEAD~1 backend/src/services/driverTelegramBot.ts
git checkout HEAD~1 backend/src/controllers/driverController.ts
git checkout HEAD~1 backend/prisma/migrations/20251018000000_add_vehicle_assigned_status/

# Откат миграции (ВНИМАНИЕ: это может повлиять на данные!)
# Не рекомендуется, лучше оставить новое значение enum

cd backend
npm run build
pm2 restart all
```

## Что делать, если миграция не применилась

Если команда `npx prisma migrate deploy` выдает ошибку, попробуйте применить миграцию вручную:

```bash
# Подключитесь к PostgreSQL
psql -U stc_user -d stc_transfer

# Выполните SQL команду
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'VEHICLE_ASSIGNED';

# Проверьте результат
SELECT unnest(enum_range(NULL::public."BookingStatus"));

# Выход
\q

# Отметьте миграцию как примененную
cd ~/apps/stc-transfer/backend
npx prisma migrate resolve --applied 20251018000000_add_vehicle_assigned_status
```

## FAQ

**Q: Почему возникла эта проблема?**
A: Схема Prisma была изменена (добавлено значение `VEHICLE_ASSIGNED`), но миграция не была создана и не была применена к базе данных на сервере.

**Q: Безопасно ли добавлять новое значение в enum?**
A: Да, добавление нового значения в enum безопасно и не повлияет на существующие данные.

**Q: Что делать, если в базе уже есть записи со статусом, которого нет в enum?**
A: Это невозможно, PostgreSQL не позволяет вставить значение, которого нет в enum.

**Q: Нужно ли останавливать сервисы перед применением миграции?**
A: Нет, для такого простого изменения (добавление значения в enum) останавливать сервисы не обязательно. Но после применения миграции обязательно перезапустите сервисы.
