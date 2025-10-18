# Исправление проблемы с аутентификацией водителей

## Проблема

При попытке войти как водитель через бот водителя появлялась ошибка:

```
❌ Водитель с таким номером телефона не найден в системе.
```

Это происходило из-за разных форматов номеров телефонов:

- В админ панели: `+998 97-703-79-42` (с дефисами)
- В боте: `+998 97 703 79 42` (с пробелами)

## Решение

Изменена логика поиска водителей по номеру телефона для сравнения только цифр, игнорируя форматирование (пробелы, дефисы и т.д.).

### Измененные файлы

1. **backend/src/services/driverTelegramBot.ts** - метод `handleContactShared`

   - Теперь получает всех водителей из базы
   - Сравнивает только цифры в номерах
   - Добавлено логирование для отладки

2. **backend/src/controllers/driverController.ts** - метод `loginByPhone`
   - Аналогичная логика для API авторизации
   - Нормализация номеров перед поиском

## Деплой на сервер

### Шаг 1: Подключение к серверу

```bash
ssh user@your-server-ip
```

### Шаг 2: Переход в директорию проекта

```bash
cd /path/to/stc-transfer
```

### Шаг 3: Получение обновлений

```bash
git pull origin main
```

### Шаг 4: Установка зависимостей

```bash
cd backend
npm install
```

### Шаг 5: Компиляция

```bash
npm run build
```

### Шаг 6: Перезапуск сервисов

#### Вариант A: Использование PM2

```bash
pm2 restart backend
pm2 restart telegram-bot
pm2 restart driver-bot
```

#### Вариант B: Использование systemd

```bash
sudo systemctl restart stc-backend
sudo systemctl restart stc-telegram-bot
sudo systemctl restart stc-driver-bot
```

#### Вариант C: Использование скрипта server-control.sh

```bash
cd /path/to/stc-transfer
./server-control.sh restart
```

### Шаг 7: Проверка статуса

```bash
pm2 status
# или
sudo systemctl status stc-backend
sudo systemctl status stc-driver-bot
```

### Шаг 8: Проверка логов

```bash
# PM2
pm2 logs driver-bot --lines 50

# systemd
sudo journalctl -u stc-driver-bot -f

# Файловые логи
tail -f /path/to/stc-transfer/logs/backend.log
```

## Тестирование

1. Откройте бот водителя в Telegram
2. Нажмите `/start`
3. Поделитесь своим номером телефона
4. Должно появиться сообщение: `✅ Спасибо! Ваш номер телефона подтвержден.`
5. Попробуйте открыть приложение водителя

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

## Проверка работы

Если проблема не решена:

1. Проверьте логи бэкенда:

```bash
pm2 logs backend --lines 100
```

2. Проверьте формат номера в базе данных:

```bash
cd backend
npx prisma studio
```

Откройте таблицу `Driver` и проверьте поле `phone`

3. Убедитесь, что номер водителя действительно существует в базе

4. Проверьте, что бэкенд перезапущен и использует новый код:

```bash
pm2 describe backend
# Проверьте время последнего рестарта
```

## Откат изменений (если необходимо)

```bash
cd /path/to/stc-transfer
git checkout HEAD~1 backend/src/services/driverTelegramBot.ts
git checkout HEAD~1 backend/src/controllers/driverController.ts
cd backend
npm run build
pm2 restart all
```
