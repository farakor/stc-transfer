# Скрипты для развертывания STC Transfer

## Описание скриптов

### 1. setup-server.sh

**Назначение:** Автоматическая настройка чистого сервера Ubuntu 24

**Что делает:**

- Обновляет систему
- Устанавливает Node.js 20.x
- Устанавливает PostgreSQL
- Устанавливает Nginx
- Устанавливает PM2
- Устанавливает Certbot для SSL
- Настраивает firewall
- Создает необходимые директории

**Использование:**

```bash
chmod +x setup-server.sh
./setup-server.sh
```

---

### 2. setup-database.sh

**Назначение:** Создание базы данных и пользователя PostgreSQL

**Что делает:**

- Создает пользователя базы данных
- Создает базу данных
- Выдает необходимые права
- Тестирует подключение
- Выводит строку подключения для .env

**Использование:**

```bash
chmod +x setup-database.sh
./setup-database.sh
```

---

### 3. deploy.sh

**Назначение:** Развертывание и обновление приложения

**Что делает:**

- Получает последние изменения из Git
- Устанавливает зависимости backend и frontend
- Генерирует Prisma Client
- Применяет миграции базы данных
- Собирает backend и frontend
- Перезапускает приложение через PM2
- Проверяет статус и здоровье приложения

**Использование:**

```bash
chmod +x deploy.sh
./deploy.sh
```

---

### 4. setup-ssl.sh

**Назначение:** Настройка SSL сертификата Let's Encrypt

**Что делает:**

- Проверяет DNS запись
- Проверяет конфигурацию Nginx
- Получает SSL сертификат через Certbot
- Настраивает автоматическое обновление
- Перезагружает Nginx

**Использование:**

```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```

---

### 5. backup-db.sh

**Назначение:** Резервное копирование базы данных

**Что делает:**

- Создает сжатую копию базы данных
- Удаляет старые бэкапы (старше 7 дней)
- Показывает список всех бэкапов

**Использование:**

```bash
# Установите пароль БД
export DB_PASSWORD='ваш_пароль'

chmod +x backup-db.sh
./backup-db.sh
```

**Автоматизация (cron):**

```bash
crontab -e
# Добавьте строку для ежедневного бэкапа в 2:00
0 2 * * * export DB_PASSWORD='your_password' && /home/stc/apps/stc-transfer/deploy-scripts/backup-db.sh >> /home/stc/backups/backup.log 2>&1
```

---

### 6. restore-db.sh

**Назначение:** Восстановление базы данных из резервной копии

**Что делает:**

- Показывает список доступных бэкапов
- Останавливает приложение
- Удаляет текущую базу данных
- Восстанавливает данные из выбранного бэкапа
- Запускает приложение

**Использование:**

```bash
# Установите пароль БД
export DB_PASSWORD='ваш_пароль'

chmod +x restore-db.sh
./restore-db.sh
```

---

### 7. setup-telegram-webhook.sh

**Назначение:** Настройка Telegram webhook для ботов

**Что делает:**

- Устанавливает webhook для клиентского бота
- Устанавливает webhook для водительского бота (опционально)
- Проверяет статус webhook
- Выводит информацию о webhook

**Использование:**

```bash
chmod +x setup-telegram-webhook.sh
./setup-telegram-webhook.sh
```

---

## Конфигурационные файлы

### nginx-config.conf

Готовая конфигурация Nginx для приложения. Включает:

- Проксирование API запросов
- Поддержка WebSocket (Socket.IO)
- Обслуживание статических файлов frontend
- Gzip компрессию
- Security headers
- Ограничение доступа к Telegram webhook
- Настройки кеширования

**Установка:**

```bash
sudo cp nginx-config.conf /etc/nginx/sites-available/srs.faruk.io
sudo ln -s /etc/nginx/sites-available/srs.faruk.io /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### ../ecosystem.config.js

Конфигурация PM2 для управления процессами приложения. Включает:

- Режим кластера (2 инстанса)
- Автоматический перезапуск
- Управление логами
- Ограничение памяти
- Graceful shutdown

**Использование:**

```bash
cd /home/stc/apps/stc-transfer
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Быстрый старт

### Полное развертывание с нуля

```bash
# 1. Подключитесь к серверу
ssh root@your-server-ip

# 2. Создайте пользователя (если нужно)
adduser stc
usermod -aG sudo stc
su - stc

# 3. Загрузите проект на сервер
cd ~
git clone https://github.com/username/stc-transfer.git apps/stc-transfer
# или используйте scp/sftp для загрузки

# 4. Перейдите в директорию со скриптами
cd apps/stc-transfer/deploy-scripts

# 5. Сделайте скрипты исполняемыми
chmod +x *.sh

# 6. Настройте сервер
./setup-server.sh

# 7. Создайте базу данных
./setup-database.sh
# Сохраните строку подключения!

# 8. Создайте .env файлы
cd ../backend
nano .env
# Вставьте конфигурацию (см. DEPLOYMENT_GUIDE.md)

cd ../frontend
nano .env.production
# Вставьте конфигурацию

# 9. Установите конфигурацию Nginx
cd ../deploy-scripts
sudo cp nginx-config.conf /etc/nginx/sites-available/srs.faruk.io
sudo ln -s /etc/nginx/sites-available/srs.faruk.io /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 10. Установите SSL
./setup-ssl.sh

# 11. Разверните приложение
./deploy.sh

# 12. Настройте Telegram webhook
./setup-telegram-webhook.sh

# 13. Настройте автоматические бэкапы
export DB_PASSWORD='your_password'
./backup-db.sh
crontab -e
# Добавьте: 0 2 * * * export DB_PASSWORD='your_password' && /home/stc/apps/stc-transfer/deploy-scripts/backup-db.sh
```

---

## Обновление приложения

```bash
cd /home/stc/apps/stc-transfer/deploy-scripts
./deploy.sh
```

---

## Управление приложением

### PM2 команды

```bash
# Статус
pm2 status

# Логи
pm2 logs stc-backend
pm2 logs stc-backend --lines 100

# Мониторинг
pm2 monit

# Перезапуск
pm2 restart stc-backend

# Остановка
pm2 stop stc-backend

# Запуск
pm2 start stc-backend

# Информация
pm2 info stc-backend

# Очистка логов
pm2 flush
```

### Nginx команды

```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка
sudo systemctl reload nginx

# Перезапуск
sudo systemctl restart nginx

# Статус
sudo systemctl status nginx

# Логи
sudo tail -f /var/log/nginx/stc-access.log
sudo tail -f /var/log/nginx/stc-error.log
```

### PostgreSQL команды

```bash
# Подключение
psql -h localhost -U stc_user -d stc_transfer

# Статус
sudo systemctl status postgresql

# Перезапуск
sudo systemctl restart postgresql

# Логи
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## Мониторинг

### Проверка здоровья

```bash
# API health check
curl https://srs.faruk.io/api/health

# Telegram webhook info
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# SSL проверка
curl -I https://srs.faruk.io
```

### Системные ресурсы

```bash
# CPU и память
htop

# Дисковое пространство
df -h

# Использование памяти
free -h

# Сетевые соединения
sudo netstat -tulpn | grep LISTEN
```

---

## Решение проблем

### Backend не запускается

```bash
# Проверьте логи
pm2 logs stc-backend --lines 100

# Проверьте .env
cat /home/stc/apps/stc-transfer/backend/.env

# Проверьте БД
psql -h localhost -U stc_user -d stc_transfer
```

### 502 Bad Gateway

```bash
# Проверьте PM2
pm2 status

# Проверьте Nginx
sudo tail -f /var/log/nginx/stc-error.log

# Проверьте порты
sudo netstat -tulpn | grep 3001
```

### SSL проблемы

```bash
# Проверьте сертификат
sudo certbot certificates

# Обновите сертификат
sudo certbot renew

# Проверьте Nginx
sudo nginx -t
```

---

## Безопасность

### Рекомендации

1. Используйте сильные пароли для БД
2. Сгенерируйте уникальный JWT_SECRET
3. Регулярно обновляйте систему: `sudo apt update && sudo apt upgrade`
4. Мониторьте логи на подозрительную активность
5. Настройте fail2ban для защиты от брутфорса
6. Регулярно делайте бэкапы БД
7. Используйте SSH ключи вместо паролей
8. Ограничьте доступ к портам через firewall

### Установка fail2ban (опционально)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Дополнительная информация

Подробная документация: `/home/stc/apps/stc-transfer/DEPLOYMENT_GUIDE.md`

Для получения помощи проверьте:

- PM2 логи: `pm2 logs`
- Nginx логи: `/var/log/nginx/`
- PostgreSQL логи: `/var/log/postgresql/`
- Системные логи: `sudo journalctl -xe`
