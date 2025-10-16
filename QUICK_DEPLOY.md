# ⚡ Быстрое развертывание STC Transfer

> Краткая версия для опытных пользователей. Полная документация: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## Предварительные требования

- Ubuntu 24.04 сервер с SSH доступом
- DNS запись `srs.faruk.io` → IP сервера
- Telegram bot token
- Email для Let's Encrypt

## Быстрая установка (5 команд)

```bash
# 1. Базовая настройка сервера (от пользователя с sudo)
cd /home/stc/apps/stc-transfer/deploy-scripts
chmod +x *.sh
./setup-server.sh

# 2. Создать базу данных
./setup-database.sh
# Сохраните DATABASE_URL!

# 3. Настроить .env файлы
cd ../backend
cp ../deploy-scripts/.env.backend.example .env
nano .env  # Заполните: DATABASE_URL, TELEGRAM_BOT_TOKEN, JWT_SECRET

cd ../frontend
cp ../deploy-scripts/.env.frontend.example .env.production
nano .env.production  # Заполните: API_URL, BOT_USERNAME

# 4. Настроить Nginx и SSL
cd ../deploy-scripts
sudo cp nginx-config.conf /etc/nginx/sites-available/srs.faruk.io
sudo ln -s /etc/nginx/sites-available/srs.faruk.io /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
./setup-ssl.sh  # Введите email

# 5. Развернуть приложение
./deploy.sh
./setup-telegram-webhook.sh  # Введите bot token
```

## Генерация JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Обязательные переменные .env

### Backend (.env)

```env
DATABASE_URL="postgresql://stc_user:password@localhost:5432/stc_transfer"
TELEGRAM_BOT_TOKEN="ваш_токен"
TELEGRAM_WEBHOOK_URL="https://srs.faruk.io"
JWT_SECRET="сгенерированный_ключ_64_символа"
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS="https://srs.faruk.io"
```

### Frontend (.env.production)

```env
VITE_API_URL=https://srs.faruk.io/api
VITE_SOCKET_URL=https://srs.faruk.io
VITE_TELEGRAM_BOT_USERNAME=ваш_бот
```

## Проверка

```bash
# Backend
curl https://srs.faruk.io/api/health

# PM2
pm2 status

# Telegram webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Логи
pm2 logs stc-backend --lines 50
```

## Управление

```bash
# Перезапуск
pm2 restart stc-backend

# Обновление
cd /home/stc/apps/stc-transfer/deploy-scripts
./deploy.sh

# Бэкап БД
export DB_PASSWORD='пароль' && ./backup-db.sh

# Логи
pm2 logs stc-backend
sudo tail -f /var/log/nginx/stc-error.log
```

## Структура директорий

```
/home/stc/
├── apps/
│   └── stc-transfer/
│       ├── backend/
│       │   ├── .env
│       │   ├── dist/
│       │   └── ...
│       ├── frontend/
│       │   ├── .env.production
│       │   ├── dist/
│       │   └── ...
│       ├── logs/
│       ├── deploy-scripts/
│       └── ecosystem.config.js
└── backups/
    └── postgres/
```

## Типичные проблемы

### 502 Bad Gateway

```bash
pm2 restart stc-backend
sudo systemctl reload nginx
```

### Telegram webhook не работает

```bash
# Проверить info
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Переустановить
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
./setup-telegram-webhook.sh
```

### Backend не запускается

```bash
pm2 logs stc-backend --lines 100
# Проверьте .env файл и DATABASE_URL
```

## Cron для автобэкапа

```bash
crontab -e
# Добавить:
0 2 * * * export DB_PASSWORD='пароль' && /home/stc/apps/stc-transfer/deploy-scripts/backup-db.sh >> /home/stc/backups/backup.log 2>&1
```

## Полезные ссылки

- 📚 Полная документация: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- ✅ Чеклист: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- 🔧 Скрипты: [deploy-scripts/README.md](deploy-scripts/README.md)

## Важно

1. **Безопасность**: используйте сильные пароли и уникальный JWT_SECRET
2. **Бэкапы**: настройте автоматические резервные копии БД
3. **Мониторинг**: регулярно проверяйте `pm2 logs` и `pm2 monit`
4. **Обновления**: держите систему и зависимости актуальными

---

🎉 **Готово!** Приложение доступно: https://srs.faruk.io

Админ-панель: https://srs.faruk.io/admin
