# 📋 Чеклист для развертывания STC Transfer

## Подготовка к развертыванию

### ☐ Серверные требования

- [ ] Ubuntu 24.04 LTS сервер
- [ ] Минимум 2GB RAM
- [ ] Минимум 20GB дискового пространства
- [ ] Доступ по SSH
- [ ] Статический IP адрес

### ☐ DNS настройка

- [ ] DNS запись A для `srs.faruk.io` указывает на IP сервера
- [ ] DNS изменения распространились (проверить: `dig srs.faruk.io +short`)

### ☐ Необходимые данные

- [ ] Telegram bot token (основной бот)
- [ ] Telegram bot token (водительский бот, если используется)
- [ ] Telegram bot username
- [ ] Email для Let's Encrypt уведомлений
- [ ] Безопасный пароль для PostgreSQL
- [ ] Сгенерированный JWT_SECRET

---

## Этап 1: Настройка сервера

### ☐ Базовая настройка

- [ ] Подключение к серверу: `ssh root@server-ip`
- [ ] Создание пользователя: `adduser stc`
- [ ] Добавление в sudo группу: `usermod -aG sudo stc`
- [ ] Переключение на пользователя: `su - stc`

### ☐ Установка зависимостей

- [ ] Запуск скрипта: `./deploy-scripts/setup-server.sh`
- [ ] Проверка Node.js: `node --version` (должно быть v20.x.x)
- [ ] Проверка PostgreSQL: `sudo systemctl status postgresql`
- [ ] Проверка Nginx: `sudo systemctl status nginx`
- [ ] Проверка PM2: `pm2 --version`

### ☐ Настройка firewall

- [ ] UFW включен: `sudo ufw status`
- [ ] Порты 80, 443, SSH открыты

---

## Этап 2: Настройка базы данных

### ☐ PostgreSQL

- [ ] Создание базы данных: `./deploy-scripts/setup-database.sh`
- [ ] Сохранена строка подключения DATABASE_URL
- [ ] Тест подключения выполнен успешно

---

## Этап 3: Развертывание кода

### ☐ Код приложения

- [ ] Репозиторий клонирован в `~/apps/stc-transfer`
- [ ] Или код загружен через scp/sftp

### ☐ Backend конфигурация

- [ ] Создан файл `backend/.env`
- [ ] Заполнены все обязательные переменные:
  - [ ] DATABASE_URL
  - [ ] TELEGRAM_BOT_TOKEN
  - [ ] TELEGRAM_WEBHOOK_URL
  - [ ] JWT_SECRET (сгенерирован!)
  - [ ] NODE_ENV=production
  - [ ] PORT=3001
  - [ ] ALLOWED_ORIGINS

### ☐ Frontend конфигурация

- [ ] Создан файл `frontend/.env.production`
- [ ] Заполнены переменные:
  - [ ] VITE_API_URL=https://srs.faruk.io/api
  - [ ] VITE_SOCKET_URL=https://srs.faruk.io
  - [ ] VITE_TELEGRAM_BOT_USERNAME

### ☐ Backend сборка

- [ ] `cd backend && npm install`
- [ ] `npm run db:generate`
- [ ] `npx prisma migrate deploy`
- [ ] `npm run build`
- [ ] Проверка: папка `dist` создана

### ☐ Frontend сборка

- [ ] `cd frontend && npm install`
- [ ] `npm run build`
- [ ] Проверка: папка `dist` создана

### ☐ Создание администратора

- [ ] `cd backend && npm run create-super-admin`
- [ ] Сохранены учетные данные администратора

---

## Этап 4: Настройка Nginx

### ☐ Конфигурация

- [ ] Скопирован конфиг: `sudo cp deploy-scripts/nginx-config.conf /etc/nginx/sites-available/srs.faruk.io`
- [ ] Создан symlink: `sudo ln -s /etc/nginx/sites-available/srs.faruk.io /etc/nginx/sites-enabled/`
- [ ] Удален default: `sudo rm /etc/nginx/sites-enabled/default`
- [ ] Права на dist: `chmod 755 ~/apps/stc-transfer/frontend/dist`
- [ ] Тест конфига: `sudo nginx -t` (должно быть OK)
- [ ] Перезагрузка: `sudo systemctl reload nginx`

---

## Этап 5: Настройка SSL

### ☐ Let's Encrypt

- [ ] Запуск скрипта: `./deploy-scripts/setup-ssl.sh`
- [ ] Или вручную: `sudo certbot --nginx -d srs.faruk.io`
- [ ] SSL сертификат получен
- [ ] Автообновление настроено: `sudo certbot renew --dry-run`
- [ ] Nginx перезагружен с HTTPS

### ☐ Проверка SSL

- [ ] Открывается https://srs.faruk.io (без ошибок)
- [ ] HTTP редиректит на HTTPS
- [ ] SSL оценка A на SSLLabs (опционально)

---

## Этап 6: Запуск приложения

### ☐ PM2 конфигурация

- [ ] Создана директория логов: `mkdir -p ~/apps/stc-transfer/logs`
- [ ] PM2 конфиг на месте: `ecosystem.config.js`
- [ ] Путь в конфиге правильный: `/home/stc/apps/stc-transfer`

### ☐ Запуск

- [ ] `pm2 start ecosystem.config.js`
- [ ] `pm2 status` - показывает "online"
- [ ] `pm2 save` - сохранить конфигурацию
- [ ] `pm2 startup` - выполнена команда автозапуска
- [ ] PM2 перезапустится после reboot

---

## Этап 7: Настройка Telegram

### ☐ Webhook клиентского бота

- [ ] Запуск скрипта: `./deploy-scripts/setup-telegram-webhook.sh`
- [ ] Или вручную через curl
- [ ] Проверка: `curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"`
- [ ] URL: `https://srs.faruk.io/api/telegram/webhook`
- [ ] pending_update_count: 0

### ☐ Webhook водительского бота (если есть)

- [ ] Webhook установлен
- [ ] URL: `https://srs.faruk.io/api/telegram/driver-webhook`
- [ ] Проверка выполнена

---

## Этап 8: Тестирование

### ☐ Backend API

- [ ] Health check: `curl https://srs.faruk.io/api/health`
- [ ] Возвращает: `{"status":"ok",...}`

### ☐ Frontend

- [ ] Открывается https://srs.faruk.io
- [ ] Страница загружается без ошибок
- [ ] Нет ошибок в консоли браузера (F12)

### ☐ WebSocket

- [ ] В Network -> WS видно подключение к socket.io
- [ ] Статус: 101 Switching Protocols
- [ ] Нет ошибок подключения

### ☐ Telegram боты

- [ ] Основной бот отвечает на /start
- [ ] Водительский бот отвечает на /start
- [ ] Inline кнопки работают
- [ ] Отправка сообщений работает

### ☐ Админ-панель

- [ ] Открывается https://srs.faruk.io/admin
- [ ] Вход с учетными данными работает
- [ ] Dashboard загружается
- [ ] Нет ошибок в консоли

### ☐ Создание заказа (E2E тест)

- [ ] Пользователь может создать заказ через бота
- [ ] Заказ отображается в админ-панели
- [ ] Водитель получает уведомление
- [ ] Статусы заказа обновляются
- [ ] WebSocket обновления работают

---

## Этап 9: Мониторинг и резервное копирование

### ☐ Логирование

- [ ] PM2 логи работают: `pm2 logs stc-backend --lines 50`
- [ ] Nginx логи доступны: `/var/log/nginx/stc-*.log`
- [ ] Настроена ротация логов

### ☐ Резервное копирование

- [ ] Скрипт бэкапа работает: `./deploy-scripts/backup-db.sh`
- [ ] Cron задача для автобэкапа настроена
- [ ] Проверка: `crontab -l`
- [ ] Тестовый бэкап создан и проверен

### ☐ Мониторинг

- [ ] PM2 monit работает: `pm2 monit`
- [ ] Использование ресурсов в норме
- [ ] Нет memory leaks

---

## Этап 10: Безопасность

### ☐ Пароли и ключи

- [ ] Все пароли надежные (16+ символов)
- [ ] JWT_SECRET уникальный и случайный
- [ ] .env файлы не в Git репозитории
- [ ] Пароли сохранены в безопасном месте (password manager)

### ☐ Firewall

- [ ] Открыты только необходимые порты
- [ ] SSH защищен (желательно SSH ключи)
- [ ] Rate limiting настроен в приложении

### ☐ Обновления

- [ ] Система обновлена: `sudo apt update && sudo apt upgrade`
- [ ] Настроены автоматические обновления безопасности (опционально)

---

## Этап 11: Документация

### ☐ Сохраните важную информацию

- [ ] IP адрес сервера
- [ ] Учетные данные PostgreSQL
- [ ] JWT_SECRET
- [ ] Telegram bot tokens
- [ ] Учетные данные супер-администратора
- [ ] SSH ключи и пароли
- [ ] Информация о DNS

### ☐ Команды для управления

```bash
# Просмотр логов
pm2 logs stc-backend

# Перезапуск приложения
pm2 restart stc-backend

# Обновление приложения
cd ~/apps/stc-transfer/deploy-scripts
./deploy.sh

# Резервное копирование БД
export DB_PASSWORD='пароль' && ./backup-db.sh

# Просмотр статуса
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
```

---

## Финальная проверка

### ☐ Все работает

- [ ] ✅ Сервер доступен по HTTPS
- [ ] ✅ SSL сертификат валидный
- [ ] ✅ Backend API отвечает
- [ ] ✅ Frontend загружается
- [ ] ✅ WebSocket соединение работает
- [ ] ✅ Telegram боты отвечают
- [ ] ✅ Админ-панель работает
- [ ] ✅ Можно создать тестовый заказ
- [ ] ✅ Уведомления отправляются
- [ ] ✅ PM2 автозапуск настроен
- [ ] ✅ Резервное копирование настроено
- [ ] ✅ Мониторинг работает

---

## 🎉 Поздравляем! Развертывание завершено!

### Полезные ссылки:

- 🌐 Приложение: https://srs.faruk.io
- 👤 Админ-панель: https://srs.faruk.io/admin
- 📊 PM2 мониторинг: `pm2 monit`
- 📝 Логи: `pm2 logs stc-backend`

### Следующие шаги:

1. Мониторьте логи первые несколько дней
2. Проверяйте резервные копии
3. Настройте алерты для критических ошибок
4. Обучите команду работе с системой

### Поддержка:

- Детальная документация: `DEPLOYMENT_GUIDE.md`
- Скрипты: `deploy-scripts/README.md`
- Telegram webhook: `setup-telegram-webhook.sh`

---

**Дата развертывания:** **\*\***\_\_\_**\*\***  
**Развернул:** **\*\***\_\_\_**\*\***  
**Версия приложения:** **\*\***\_\_\_**\*\***
