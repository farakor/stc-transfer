# Руководство по развертыванию STC Transfer на Ubuntu 24

## Содержание

1. [Подготовка сервера](#1-подготовка-сервера)
2. [Установка зависимостей](#2-установка-зависимостей)
3. [Настройка PostgreSQL](#3-настройка-postgresql)
4. [Клонирование и настройка проекта](#4-клонирование-и-настройка-проекта)
5. [Настройка Nginx](#5-настройка-nginx)
6. [Настройка SSL сертификата](#6-настройка-ssl-сертификата)
7. [Настройка PM2](#7-настройка-pm2)
8. [Настройка Telegram Webhook](#8-настройка-telegram-webhook)
9. [Финальная проверка](#9-финальная-проверка)
10. [Мониторинг и логи](#10-мониторинг-и-логи)

---

## 1. Подготовка сервера

### 1.1 Подключение к серверу

```bash
ssh root@your-server-ip
```

### 1.2 Обновление системы

```bash
apt update && apt upgrade -y
```

### 1.3 Создание пользователя для приложения

```bash
adduser stc
usermod -aG sudo stc
su - stc
```

### 1.4 Настройка firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## 2. Установка зависимостей

### 2.1 Установка Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Должно быть v20.x.x
npm --version
```

### 2.2 Установка PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
```

### 2.3 Установка Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

### 2.4 Установка PM2 глобально

```bash
sudo npm install -g pm2
pm2 --version
```

### 2.5 Установка Git

```bash
sudo apt install -y git
git --version
```

### 2.6 Установка Certbot для SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 3. Настройка PostgreSQL

### 3.1 Создание базы данных и пользователя

```bash
sudo -u postgres psql
```

В PostgreSQL консоли выполните:

```sql
-- Создаем пользователя
CREATE USER stc_user WITH PASSWORD 'ваш_безопасный_пароль_здесь';

-- Создаем базу данных
CREATE DATABASE stc_transfer OWNER stc_user;

-- Даем все права
GRANT ALL PRIVILEGES ON DATABASE stc_transfer TO stc_user;

-- Выходим
\q
```

### 3.2 Проверка подключения

```bash
psql -h localhost -U stc_user -d stc_transfer
# Введите пароль
\l  # Список баз данных
\q  # Выход
```

---

## 4. Клонирование и настройка проекта

### 4.1 Создание директории для проекта

```bash
cd ~
mkdir -p /home/stc/apps
cd /home/stc/apps
```

### 4.2 Клонирование репозитория

```bash
# Если используете Git
git clone https://github.com/ваш-репозиторий/stc-transfer.git
cd stc-transfer

# Или загрузите проект через scp/sftp
```

### 4.3 Настройка Backend

#### 4.3.1 Создание .env файла для backend

```bash
cd /home/stc/apps/stc-transfer/backend
nano .env
```

Содержимое `.env`:

```env
# Database
DATABASE_URL="postgresql://stc_user:ваш_безопасный_пароль_здесь@localhost:5432/stc_transfer"

# Telegram Bot
TELEGRAM_BOT_TOKEN="ваш_токен_бота_здесь"
TELEGRAM_WEBHOOK_URL="https://srs.faruk.io"

# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Secret (сгенерируйте безопасный ключ)
JWT_SECRET="сгенерируйте_длинный_случайный_ключ_здесь"

# CORS
ALLOWED_ORIGINS="https://srs.faruk.io"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Генерация JWT_SECRET:**

```bash
# Используйте один из этих способов:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# или
openssl rand -hex 64
```

#### 4.3.2 Установка зависимостей backend

```bash
cd /home/stc/apps/stc-transfer/backend
npm install
```

#### 4.3.3 Генерация Prisma Client

```bash
npm run db:generate
```

#### 4.3.4 Применение миграций

```bash
npx prisma migrate deploy
```

#### 4.3.5 Создание супер-администратора

```bash
npm run create-super-admin
```

#### 4.3.6 Сборка backend

```bash
npm run build
```

### 4.4 Настройка Frontend

#### 4.4.1 Создание .env файла для frontend

```bash
cd /home/stc/apps/stc-transfer/frontend
nano .env.production
```

Содержимое `.env.production`:

```env
VITE_API_URL=https://srs.faruk.io/api
VITE_SOCKET_URL=https://srs.faruk.io
VITE_TELEGRAM_BOT_USERNAME=ваш_бот_username
```

#### 4.4.2 Установка зависимостей frontend

```bash
cd /home/stc/apps/stc-transfer/frontend
npm install
```

#### 4.4.3 Сборка frontend

```bash
npm run build
```

Это создаст директорию `dist` с собранным приложением.

---

## 5. Настройка Nginx

### 5.1 Создание конфигурации для srs.faruk.io

```bash
sudo nano /etc/nginx/sites-available/srs.faruk.io
```

Содержимое файла:

```nginx
# Сначала настроим без SSL, потом Certbot автоматически добавит HTTPS

# Backend API и WebSocket
upstream backend {
    server localhost:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name srs.faruk.io;

    # Увеличиваем размер загружаемых файлов
    client_max_body_size 50M;

    # Логи
    access_log /var/log/nginx/stc-access.log;
    error_log /var/log/nginx/stc-error.log;

    # Frontend - статические файлы
    root /home/stc/apps/stc-transfer/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend статика
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # HTML файлы не кешируем
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API прокси к backend
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO WebSocket
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;

        # WebSocket headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts для WebSocket
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Telegram Webhook
    location /api/telegram {
        proxy_pass http://backend;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Ограничиваем доступ только для Telegram серверов
        # Telegram IP ranges (можно добавить дополнительные)
        allow 149.154.160.0/20;
        allow 91.108.4.0/22;
        deny all;
    }

    # Публичные файлы (если есть)
    location /public {
        alias /home/stc/apps/stc-transfer/backend/public;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 Активация конфигурации

```bash
# Создаем символическую ссылку
sudo ln -s /etc/nginx/sites-available/srs.faruk.io /etc/nginx/sites-enabled/

# Удаляем дефолтную конфигурацию
sudo rm /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
sudo nginx -t

# Перезагружаем Nginx
sudo systemctl reload nginx
```

---

## 6. Настройка SSL сертификата

### 6.1 Настройка DNS

Перед получением SSL убедитесь, что DNS запись для `srs.faruk.io` указывает на IP вашего сервера:

```bash
# Проверка DNS
dig srs.faruk.io +short
# или
nslookup srs.faruk.io
```

Должен вернуться IP вашего сервера.

### 6.2 Получение SSL сертификата

```bash
sudo certbot --nginx -d srs.faruk.io
```

Следуйте инструкциям:

- Введите email для уведомлений
- Согласитесь с Terms of Service
- Выберите опцию перенаправления HTTP на HTTPS (рекомендуется)

### 6.3 Автоматическое обновление сертификата

```bash
# Тестирование автообновления
sudo certbot renew --dry-run

# Certbot автоматически добавит задачу в cron
# Проверить можно так:
sudo systemctl status certbot.timer
```

### 6.4 Проверка конфигурации после SSL

```bash
# Certbot автоматически обновил конфигурацию Nginx
cat /etc/nginx/sites-available/srs.faruk.io

# Проверяем и перезагружаем
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Настройка PM2

### 7.1 Создание PM2 конфигурации

```bash
cd /home/stc/apps/stc-transfer
nano ecosystem.config.js
```

Содержимое `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "stc-backend",
      cwd: "/home/stc/apps/stc-transfer/backend",
      script: "dist/index.js",
      instances: 2, // или 'max' для использования всех ядер
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "/home/stc/apps/stc-transfer/logs/backend-error.log",
      out_file: "/home/stc/apps/stc-transfer/logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "500M",
      watch: false,
      ignore_watch: ["node_modules", "logs"],
    },
  ],
};
```

### 7.2 Создание директории для логов

```bash
mkdir -p /home/stc/apps/stc-transfer/logs
```

### 7.3 Запуск приложения через PM2

```bash
cd /home/stc/apps/stc-transfer

# Запуск приложения
pm2 start ecosystem.config.js

# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs stc-backend

# Сохранение конфигурации PM2
pm2 save

# Автозапуск PM2 при перезагрузке системы
pm2 startup
# Выполните команду, которую PM2 предложит
```

### 7.4 Полезные команды PM2

```bash
# Просмотр логов
pm2 logs stc-backend --lines 100

# Мониторинг в реальном времени
pm2 monit

# Перезапуск
pm2 restart stc-backend

# Остановка
pm2 stop stc-backend

# Удаление из списка процессов
pm2 delete stc-backend

# Просмотр детальной информации
pm2 info stc-backend

# Очистка логов
pm2 flush
```

---

## 8. Настройка Telegram Webhook

### 8.1 Установка webhook для бота

```bash
# Установка webhook
curl -X POST "https://api.telegram.org/bot<ВАШ_ТОКЕН_БОТА>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://srs.faruk.io/api/telegram/webhook",
    "allowed_updates": ["message", "callback_query", "inline_query"]
  }'
```

### 8.2 Проверка webhook

```bash
# Получение информации о webhook
curl "https://api.telegram.org/bot<ВАШ_ТОКЕН_БОТА>/getWebhookInfo"
```

Ответ должен содержать:

```json
{
  "ok": true,
  "result": {
    "url": "https://srs.faruk.io/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### 8.3 Если есть водительский бот (отдельный токен)

```bash
# Установка webhook для водительского бота
curl -X POST "https://api.telegram.org/bot<ТОКЕН_ВОДИТЕЛЬСКОГО_БОТА>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://srs.faruk.io/api/telegram/driver-webhook",
    "allowed_updates": ["message", "callback_query"]
  }'
```

---

## 9. Финальная проверка

### 9.1 Проверка backend API

```bash
# Проверка здоровья API
curl https://srs.faruk.io/api/health

# Должно вернуть что-то вроде:
# {"status":"ok","timestamp":"2025-10-16T..."}
```

### 9.2 Проверка frontend

```bash
# Откройте в браузере
open https://srs.faruk.io
```

### 9.3 Проверка Socket.IO

```bash
# В браузерной консоли на https://srs.faruk.io
# Откройте Developer Tools -> Network -> WS
# Должны увидеть успешное WebSocket подключение к socket.io
```

### 9.4 Проверка Telegram бота

1. Откройте бота в Telegram
2. Отправьте команду `/start`
3. Проверьте, что бот отвечает

### 9.5 Проверка логов

```bash
# PM2 логи
pm2 logs stc-backend --lines 50

# Nginx логи
sudo tail -f /var/log/nginx/stc-access.log
sudo tail -f /var/log/nginx/stc-error.log

# PostgreSQL логи
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### 9.6 Проверка портов

```bash
# Проверка, что backend слушает на порту 3001
sudo netstat -tulpn | grep 3001

# Проверка Nginx
sudo netstat -tulpn | grep nginx
```

---

## 10. Мониторинг и логи

### 10.1 Настройка ротации логов

```bash
sudo nano /etc/logrotate.d/stc-transfer
```

Содержимое:

```
/home/stc/apps/stc-transfer/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 stc stc
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 10.2 Мониторинг ресурсов

```bash
# CPU и память
htop

# Дисковое пространство
df -h

# PM2 мониторинг
pm2 monit

# Использование памяти PM2 приложениями
pm2 status
```

### 10.3 Установка мониторинга (опционально)

```bash
# PM2 Plus для продвинутого мониторинга
pm2 plus
# Следуйте инструкциям для регистрации
```

---

## Дополнительные настройки

### Настройка резервного копирования базы данных

#### Создание скрипта для бэкапа

```bash
mkdir -p /home/stc/backups
nano /home/stc/backups/backup-db.sh
```

Содержимое скрипта:

```bash
#!/bin/bash
BACKUP_DIR="/home/stc/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="stc_transfer"
DB_USER="stc_user"

mkdir -p $BACKUP_DIR

# Создание бэкапа
PGPASSWORD='ваш_пароль' pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Удаление бэкапов старше 7 дней
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql.gz"
```

Сделайте скрипт исполняемым:

```bash
chmod +x /home/stc/backups/backup-db.sh
```

#### Настройка автоматического бэкапа (cron)

```bash
crontab -e
```

Добавьте строку для ежедневного бэкапа в 2:00 ночи:

```
0 2 * * * /home/stc/backups/backup-db.sh >> /home/stc/backups/backup.log 2>&1
```

### Настройка уведомлений о сбоях (опционально)

#### Использование PM2 для email уведомлений

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Частые проблемы и решения

### Проблема 1: Backend не запускается

```bash
# Проверьте логи
pm2 logs stc-backend --lines 100

# Проверьте переменные окружения
cat /home/stc/apps/stc-transfer/backend/.env

# Проверьте подключение к базе данных
psql -h localhost -U stc_user -d stc_transfer
```

### Проблема 2: Nginx возвращает 502 Bad Gateway

```bash
# Проверьте, что backend работает
pm2 status

# Проверьте Nginx логи
sudo tail -f /var/log/nginx/stc-error.log

# Проверьте, что порт 3001 слушается
sudo netstat -tulpn | grep 3001

# Перезапустите backend
pm2 restart stc-backend
```

### Проблема 3: SSL сертификат не работает

```bash
# Проверьте конфигурацию Nginx
sudo nginx -t

# Проверьте сертификат
sudo certbot certificates

# Попробуйте обновить сертификат
sudo certbot renew --force-renewal
```

### Проблема 4: Telegram webhook не работает

```bash
# Проверьте webhook info
curl "https://api.telegram.org/bot<ВАШ_ТОКЕН>/getWebhookInfo"

# Проверьте логи backend
pm2 logs stc-backend | grep telegram

# Переустановите webhook
curl -X POST "https://api.telegram.org/bot<ВАШ_ТОКЕН>/deleteWebhook"
curl -X POST "https://api.telegram.org/bot<ВАШ_ТОКЕН>/setWebhook" \
  -d "url=https://srs.faruk.io/api/telegram/webhook"
```

---

## Обновление приложения

### Процесс обновления

```bash
# 1. Перейдите в директорию проекта
cd /home/stc/apps/stc-transfer

# 2. Получите последние изменения
git pull origin main

# 3. Обновите backend
cd backend
npm install
npm run build

# 4. Примените новые миграции (если есть)
npx prisma migrate deploy

# 5. Обновите frontend
cd ../frontend
npm install
npm run build

# 6. Перезапустите backend
pm2 restart stc-backend

# 7. Проверьте статус
pm2 status
pm2 logs stc-backend --lines 50
```

---

## Чеклист после установки

- [ ] Сервер обновлен и защищен firewall
- [ ] Node.js, PostgreSQL, Nginx установлены
- [ ] База данных создана и миграции применены
- [ ] Backend собран и запущен через PM2
- [ ] Frontend собран и доступен через Nginx
- [ ] SSL сертификат установлен и работает
- [ ] Telegram webhook настроен и проверен
- [ ] PM2 автозапуск настроен
- [ ] Логи ротируются корректно
- [ ] Резервное копирование БД настроено
- [ ] Все endpoints API работают
- [ ] WebSocket соединение работает
- [ ] Telegram боты отвечают на команды
- [ ] Создан супер-администратор

---

## Контакты и поддержка

После развертывания проверьте все функции системы:

1. Регистрацию пользователей через Telegram
2. Создание заказов
3. Работу админ-панели
4. Уведомления водителям
5. Отслеживание в реальном времени
6. Analytics dashboard

При возникновении проблем проверьте логи:

- PM2: `pm2 logs`
- Nginx: `/var/log/nginx/`
- PostgreSQL: `/var/log/postgresql/`

---

**Поздравляем! Ваше приложение STC Transfer развернуто и готово к работе! 🚀**
