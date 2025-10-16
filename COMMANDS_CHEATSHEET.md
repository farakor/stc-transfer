# 📋 Шпаргалка команд STC Transfer

> Быстрый справочник всех необходимых команд для управления приложением

---

## 🚀 Развертывание

### Первое развертывание

```bash
# Подготовка сервера
./deploy-scripts/setup-server.sh

# Создание БД
./deploy-scripts/setup-database.sh

# Развертывание приложения
./deploy-scripts/deploy.sh

# SSL сертификат
./deploy-scripts/setup-ssl.sh

# Telegram webhook
./deploy-scripts/setup-telegram-webhook.sh

# Автобэкапы
./deploy-scripts/setup-cron-backup.sh
```

### Обновление приложения

```bash
cd ~/apps/stc-transfer/deploy-scripts
./deploy.sh
```

---

## 🔄 PM2 (Управление приложением)

### Статус и управление

```bash
pm2 status                    # Статус всех процессов
pm2 info stc-backend          # Детальная информация
pm2 describe stc-backend      # Еще больше деталей

pm2 start stc-backend         # Запуск
pm2 stop stc-backend          # Остановка
pm2 restart stc-backend       # Перезапуск
pm2 reload stc-backend        # Обновление без даунтайма
pm2 delete stc-backend        # Удалить из списка
```

### Логи

```bash
pm2 logs                      # Все логи в реальном времени
pm2 logs stc-backend          # Логи конкретного приложения
pm2 logs --lines 100          # Последние 100 строк
pm2 logs --err                # Только ошибки
pm2 flush                     # Очистить все логи
```

### Мониторинг

```bash
pm2 monit                     # Интерактивный мониторинг
pm2 list                      # Список процессов
pm2 jlist                     # JSON формат
```

### Конфигурация

```bash
pm2 start ecosystem.config.js # Запуск из конфига
pm2 save                      # Сохранить текущий список
pm2 startup                   # Создать автозапуск
pm2 unstartup                 # Удалить автозапуск
pm2 resurrect                 # Восстановить сохраненные процессы
```

---

## 🌐 Nginx

### Управление сервисом

```bash
sudo systemctl start nginx    # Запуск
sudo systemctl stop nginx     # Остановка
sudo systemctl restart nginx  # Перезапуск
sudo systemctl reload nginx   # Перезагрузка конфига
sudo systemctl status nginx   # Статус
```

### Конфигурация

```bash
sudo nginx -t                 # Проверка конфигурации
sudo nginx -T                 # Показать полную конфигурацию

# Редактировать конфиг
sudo nano /etc/nginx/sites-available/srs.faruk.io

# Активировать сайт
sudo ln -s /etc/nginx/sites-available/srs.faruk.io /etc/nginx/sites-enabled/

# Деактивировать сайт
sudo rm /etc/nginx/sites-enabled/srs.faruk.io
```

### Логи

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/stc-access.log
sudo tail -f /var/log/nginx/stc-error.log

# Последние N строк
sudo tail -100 /var/log/nginx/stc-error.log
```

---

## 🐘 PostgreSQL

### Управление сервисом

```bash
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

### Подключение к БД

```bash
# Как пользователь postgres
sudo -u postgres psql

# Как конкретный пользователь
psql -U stc_user -d stc_transfer -h localhost

# С паролем из переменной
PGPASSWORD='password' psql -U stc_user -d stc_transfer
```

### Полезные SQL команды

```sql
-- Список баз данных
\l

-- Подключиться к БД
\c stc_transfer

-- Список таблиц
\dt

-- Описание таблицы
\d bookings

-- Размер БД
SELECT pg_size_pretty(pg_database_size('stc_transfer'));

-- Текущие подключения
SELECT * FROM pg_stat_activity;

-- Выход
\q
```

### Бэкап и восстановление

```bash
# Бэкап
export DB_PASSWORD='password'
./deploy-scripts/backup-db.sh

# Вручную
pg_dump -U stc_user -h localhost stc_transfer > backup.sql
pg_dump -U stc_user -h localhost stc_transfer | gzip > backup.sql.gz

# Восстановление
./deploy-scripts/restore-db.sh

# Вручную
psql -U stc_user -h localhost stc_transfer < backup.sql
gunzip -c backup.sql.gz | psql -U stc_user -h localhost stc_transfer
```

---

## 🔒 SSL / Certbot

### Получение сертификата

```bash
# Автоматически (рекомендуется)
./deploy-scripts/setup-ssl.sh

# Вручную
sudo certbot --nginx -d srs.faruk.io
```

### Управление сертификатами

```bash
sudo certbot certificates      # Список сертификатов
sudo certbot renew             # Обновить все сертификаты
sudo certbot renew --dry-run   # Тест обновления
sudo certbot delete            # Удалить сертификат
```

### Проверка автообновления

```bash
sudo systemctl status certbot.timer
sudo systemctl list-timers | grep certbot
```

---

## 🤖 Telegram

### Webhook

```bash
# Установка webhook (через скрипт)
./deploy-scripts/setup-telegram-webhook.sh

# Вручную
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://srs.faruk.io/api/telegram/webhook"

# Проверка webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Удаление webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"

# Получение обновлений (для тестирования)
curl "https://api.telegram.org/bot<TOKEN>/getUpdates"
```

### Информация о боте

```bash
curl "https://api.telegram.org/bot<TOKEN>/getMe"
```

---

## 💾 Резервное копирование

### Бэкап базы данных

```bash
# Через скрипт (рекомендуется)
export DB_PASSWORD='password'
./deploy-scripts/backup-db.sh

# Список бэкапов
ls -lh ~/backups/postgres/

# Размер бэкапов
du -sh ~/backups/postgres/
```

### Восстановление

```bash
export DB_PASSWORD='password'
./deploy-scripts/restore-db.sh
```

### Настройка автоматических бэкапов

```bash
./deploy-scripts/setup-cron-backup.sh

# Или вручную
crontab -e
# Добавить:
# 0 2 * * * export DB_PASSWORD='password' && ~/apps/stc-transfer/deploy-scripts/backup-db.sh

# Просмотр cron задач
crontab -l

# Логи cron
tail -f /var/log/syslog | grep CRON
```

---

## 🏥 Диагностика

### Health check

```bash
./deploy-scripts/health-check.sh
```

### Проверка API

```bash
curl https://srs.faruk.io/api/health
curl -I https://srs.faruk.io
```

### Проверка портов

```bash
sudo netstat -tulpn | grep LISTEN
sudo netstat -tulpn | grep 3001
sudo netstat -tulpn | grep 443

# Или с помощью ss
sudo ss -tulpn | grep LISTEN
```

### Проверка процессов

```bash
ps aux | grep node
ps aux | grep nginx
ps aux | grep postgres
```

### Проверка DNS

```bash
dig srs.faruk.io
nslookup srs.faruk.io
host srs.faruk.io
```

---

## 📊 Мониторинг ресурсов

### CPU

```bash
top                           # Интерактивный мониторинг
htop                          # Улучшенная версия (нужно установить)
uptime                        # Загрузка системы
```

### Память

```bash
free -h                       # Использование памяти
cat /proc/meminfo             # Детальная информация
```

### Диск

```bash
df -h                         # Свободное место
du -sh /path/to/dir          # Размер директории
du -h --max-depth=1 .        # Размер поддиректорий

# Самые большие файлы
find . -type f -size +100M -exec ls -lh {} \;
```

### Сеть

```bash
ifconfig                      # Сетевые интерфейсы
ip addr show                  # Современная альтернатива
netstat -an                   # Все соединения
iftop                         # Мониторинг bandwidth (нужно установить)
```

---

## 📝 Логи

### Application логи (PM2)

```bash
pm2 logs stc-backend
pm2 logs stc-backend --lines 100
pm2 logs stc-backend --err
tail -f ~/apps/stc-transfer/logs/backend-out.log
tail -f ~/apps/stc-transfer/logs/backend-error.log
```

### Nginx логи

```bash
sudo tail -f /var/log/nginx/stc-access.log
sudo tail -f /var/log/nginx/stc-error.log

# Анализ самых частых запросов
sudo cat /var/log/nginx/stc-access.log | cut -d'"' -f2 | sort | uniq -c | sort -rn | head
```

### PostgreSQL логи

```bash
sudo tail -f /var/log/postgresql/postgresql-*-main.log
sudo journalctl -u postgresql
```

### Системные логи

```bash
sudo journalctl -xe           # Последние события
sudo journalctl -f            # В реальном времени
sudo journalctl -u nginx      # Логи Nginx
sudo journalctl -u postgresql # Логи PostgreSQL
```

---

## 🔄 Git

### Обновление кода

```bash
cd ~/apps/stc-transfer
git pull origin main
git status
git log --oneline -10
```

### Откат к предыдущей версии

```bash
git log --oneline             # Найти нужный commit
git checkout <commit-hash>
./deploy-scripts/deploy.sh
```

### Информация

```bash
git branch                    # Текущая ветка
git remote -v                 # Удаленные репозитории
git diff                      # Изменения
```

---

## 🔧 Системное обслуживание

### Обновление системы

```bash
sudo apt update               # Обновить список пакетов
sudo apt upgrade              # Установить обновления
sudo apt dist-upgrade         # Обновление дистрибутива
sudo apt autoremove           # Удалить ненужные пакеты
```

### Очистка диска

```bash
# Очистка apt кеша
sudo apt clean
sudo apt autoclean

# Очистка старых логов
sudo journalctl --vacuum-time=7d
sudo journalctl --vacuum-size=500M

# Очистка PM2 логов
pm2 flush

# Очистка старых бэкапов (старше 30 дней)
find ~/backups/postgres/ -name "backup_*.sql.gz" -mtime +30 -delete
```

### Перезагрузка сервера

```bash
sudo reboot                   # Перезагрузка
sudo shutdown -h now          # Выключение
```

---

## 🔐 Безопасность

### Firewall (UFW)

```bash
sudo ufw status               # Статус
sudo ufw enable               # Включить
sudo ufw disable              # Выключить

sudo ufw allow 80/tcp         # Разрешить порт
sudo ufw allow 443/tcp
sudo ufw allow OpenSSH

sudo ufw deny 3001/tcp        # Запретить порт

sudo ufw status numbered      # Нумерованный список правил
sudo ufw delete <number>      # Удалить правило
```

### Проверка безопасности

```bash
# Открытые порты
sudo nmap localhost

# Неудачные попытки входа
sudo grep "Failed password" /var/log/auth.log

# Проверка SSL
curl -I https://srs.faruk.io
openssl s_client -connect srs.faruk.io:443 -servername srs.faruk.io
```

---

## 🚨 Аварийное восстановление

### Backend не работает

```bash
pm2 restart stc-backend
pm2 logs stc-backend --lines 100
cd ~/apps/stc-transfer/deploy-scripts && ./deploy.sh
```

### Nginx не работает

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/stc-error.log
```

### База данных не доступна

```bash
sudo systemctl restart postgresql
psql -U stc_user -d stc_transfer -h localhost
```

### Полное восстановление

```bash
# 1. Восстановить БД из бэкапа
export DB_PASSWORD='password'
./deploy-scripts/restore-db.sh

# 2. Передеплой приложения
./deploy-scripts/deploy.sh

# 3. Проверка
./deploy-scripts/health-check.sh
```

---

## 📱 Быстрые проверки

### Одной командой

```bash
# Проверка всего
./deploy-scripts/health-check.sh

# Статус сервисов
sudo systemctl status nginx postgresql && pm2 status

# Использование ресурсов
free -h && df -h && uptime
```

---

## 💡 Полезные алиасы

Добавьте в `~/.bashrc` для удобства:

```bash
# STC Transfer алиасы
alias stc-logs='pm2 logs stc-backend'
alias stc-status='pm2 status && sudo systemctl status nginx postgresql'
alias stc-restart='pm2 restart stc-backend'
alias stc-deploy='cd ~/apps/stc-transfer/deploy-scripts && ./deploy.sh'
alias stc-health='cd ~/apps/stc-transfer/deploy-scripts && ./health-check.sh'
alias stc-backup='export DB_PASSWORD="password" && cd ~/apps/stc-transfer/deploy-scripts && ./backup-db.sh'

# Применить алиасы
source ~/.bashrc
```

---

## 📞 Экстренные контакты

### Быстрая диагностика

```bash
# Сохранить все важные логи в один файл
{
  echo "=== PM2 Status ==="
  pm2 status
  echo -e "\n=== PM2 Logs ==="
  pm2 logs stc-backend --lines 100 --nostream
  echo -e "\n=== Nginx Error Log ==="
  sudo tail -100 /var/log/nginx/stc-error.log
  echo -e "\n=== System Info ==="
  free -h
  df -h
  uptime
} > ~/debug-$(date +%Y%m%d-%H%M%S).log
```

---

**💾 Сохраните этот файл для быстрого доступа!**

Для более детальной информации смотрите:

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- [DEPLOYMENT_INDEX.md](DEPLOYMENT_INDEX.md)
