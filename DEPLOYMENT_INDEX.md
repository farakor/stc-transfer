# 📚 Индекс документации по развертыванию STC Transfer

## 🚀 Быстрый старт

Выберите подходящий гайд в зависимости от вашего опыта:

### Для опытных пользователей

➡️ **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - Быстрое развертывание (5 команд, ~15 минут)

### Для всех остальных

➡️ **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Детальная пошаговая инструкция (~1 час)

### Чеклист

➡️ **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Полный чеклист развертывания

---

## 📖 Документация

### Основные гайды

| Документ                                           | Описание                           | Кому подходит                     |
| -------------------------------------------------- | ---------------------------------- | --------------------------------- |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)         | Полная детальная инструкция        | Всем, кто впервые разворачивает   |
| [QUICK_DEPLOY.md](QUICK_DEPLOY.md)                 | Краткая инструкция                 | Опытным системным администраторам |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Чеклист с галочками                | Для контроля процесса             |
| [SYSTEM_REQUIREMENTS.md](SYSTEM_REQUIREMENTS.md)   | Системные требования и оптимизация | Для планирования ресурсов         |

---

## 🛠️ Скрипты развертывания

Все скрипты находятся в директории [deploy-scripts/](deploy-scripts/)

### Основные скрипты

| Скрипт                      | Назначение               | Когда использовать             |
| --------------------------- | ------------------------ | ------------------------------ |
| `setup-server.sh`           | Настройка сервера        | Первый запуск на новом сервере |
| `setup-database.sh`         | Создание БД              | После установки PostgreSQL     |
| `deploy.sh`                 | Развертывание/обновление | Первый запуск и обновления     |
| `setup-ssl.sh`              | Настройка SSL            | После настройки Nginx          |
| `setup-telegram-webhook.sh` | Настройка Telegram       | После развертывания            |

### Скрипты обслуживания

| Скрипт                 | Назначение            | Когда использовать          |
| ---------------------- | --------------------- | --------------------------- |
| `backup-db.sh`         | Резервное копирование | Регулярно (через cron)      |
| `restore-db.sh`        | Восстановление БД     | При необходимости           |
| `setup-cron-backup.sh` | Настройка автобэкапа  | После первого развертывания |
| `health-check.sh`      | Проверка здоровья     | Регулярно или при проблемах |

### Конфигурационные файлы

| Файл                            | Описание                   |
| ------------------------------- | -------------------------- |
| `nginx-config.conf`             | Готовая конфигурация Nginx |
| `.env.backend.example`          | Пример .env для backend    |
| `.env.frontend.example`         | Пример .env для frontend   |
| `ecosystem.config.js` (в корне) | Конфигурация PM2           |

Детальное описание всех скриптов: [deploy-scripts/README.md](deploy-scripts/README.md)

---

## 📋 Процесс развертывания

### 1️⃣ Подготовка (5 минут)

- [ ] Подготовить сервер Ubuntu 24
- [ ] Настроить DNS (`srs.faruk.io` → IP сервера)
- [ ] Получить Telegram bot token
- [ ] Подготовить email для SSL

### 2️⃣ Настройка сервера (10 минут)

```bash
./deploy-scripts/setup-server.sh
```

### 3️⃣ База данных (5 минут)

```bash
./deploy-scripts/setup-database.sh
```

### 4️⃣ Конфигурация (10 минут)

- Создать `.env` файлы
- Настроить Nginx
- Сгенерировать JWT_SECRET

### 5️⃣ Развертывание (15 минут)

```bash
./deploy-scripts/deploy.sh
```

### 6️⃣ SSL (5 минут)

```bash
./deploy-scripts/setup-ssl.sh
```

### 7️⃣ Telegram (2 минуты)

```bash
./deploy-scripts/setup-telegram-webhook.sh
```

### 8️⃣ Автобэкапы (3 минуты)

```bash
./deploy-scripts/setup-cron-backup.sh
```

### ✅ Проверка (5 минут)

```bash
./deploy-scripts/health-check.sh
```

**Общее время: ~1 час**

---

## 🔄 Обновление приложения

### Простое обновление

```bash
cd ~/apps/stc-transfer/deploy-scripts
./deploy.sh
```

### С проверкой

```bash
./deploy.sh && ./health-check.sh
```

### Откат к предыдущей версии

```bash
# 1. Git откат
cd ~/apps/stc-transfer
git log --oneline  # Найти нужный commit
git checkout <commit-hash>

# 2. Развертывание
cd deploy-scripts
./deploy.sh
```

---

## 🏥 Диагностика и решение проблем

### Быстрая проверка

```bash
./deploy-scripts/health-check.sh
```

### Частые проблемы

#### Backend не работает

```bash
pm2 logs stc-backend --lines 100
pm2 restart stc-backend
```

#### 502 Bad Gateway

```bash
# Проверить backend
pm2 status

# Проверить Nginx
sudo nginx -t
sudo systemctl reload nginx
```

#### Telegram webhook не работает

```bash
./deploy-scripts/setup-telegram-webhook.sh
```

#### База данных не доступна

```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

Подробнее: [DEPLOYMENT_GUIDE.md#частые-проблемы-и-решения](DEPLOYMENT_GUIDE.md#частые-проблемы-и-решения)

---

## 💾 Резервное копирование

### Ручной бэкап

```bash
export DB_PASSWORD='ваш_пароль'
./deploy-scripts/backup-db.sh
```

### Настройка автоматического бэкапа

```bash
./deploy-scripts/setup-cron-backup.sh
```

### Восстановление

```bash
export DB_PASSWORD='ваш_пароль'
./deploy-scripts/restore-db.sh
```

---

## 📊 Мониторинг

### PM2

```bash
pm2 status              # Статус процессов
pm2 logs stc-backend    # Логи в реальном времени
pm2 monit               # Интерактивный мониторинг
```

### Системные ресурсы

```bash
htop                    # CPU и память
df -h                   # Дисковое пространство
free -h                 # Использование памяти
```

### Логи

```bash
# Application
pm2 logs stc-backend --lines 100

# Nginx
sudo tail -f /var/log/nginx/stc-access.log
sudo tail -f /var/log/nginx/stc-error.log

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

---

## 🔐 Безопасность

### Чеклист безопасности

- [ ] SSL сертификат установлен
- [ ] Firewall настроен (UFW)
- [ ] Сильные пароли БД
- [ ] Уникальный JWT_SECRET
- [ ] SSH ключи (не пароли)
- [ ] Регулярные бэкапы
- [ ] Система обновлена

### Рекомендации

1. Регулярно обновляйте систему: `sudo apt update && sudo apt upgrade`
2. Мониторьте логи на подозрительную активность
3. Используйте fail2ban для защиты SSH
4. Храните бэкапы в отдельном месте (S3, Backblaze)
5. Настройте alerting при сбоях

---

## 📈 Масштабирование

### Когда нужно масштабировать?

- CPU использование >80% постоянно
- Memory использование >85% постоянно
- Response time >500ms постоянно
- Errors в логах увеличиваются

### Варианты масштабирования

1. **Вертикальное**: Увеличить RAM/CPU сервера
2. **Горизонтальное**: Добавить серверы + Load Balancer
3. **База данных**: Настроить репликацию PostgreSQL
4. **Кеширование**: Добавить Redis
5. **CDN**: Для статических файлов

Подробнее: [SYSTEM_REQUIREMENTS.md#масштабирование](SYSTEM_REQUIREMENTS.md#масштабирование)

---

## 🆘 Получение помощи

### Логи для диагностики

```bash
# Собрать все важные логи
pm2 logs stc-backend --lines 200 > ~/debug.log
sudo tail -200 /var/log/nginx/stc-error.log >> ~/debug.log
sudo journalctl -xe >> ~/debug.log
```

### Health check

```bash
./deploy-scripts/health-check.sh
```

### Системная информация

```bash
uname -a
node --version
npm --version
pm2 --version
nginx -v
psql --version
```

---

## 📝 Важные команды

### PM2

```bash
pm2 status                    # Статус
pm2 restart stc-backend       # Перезапуск
pm2 logs stc-backend          # Логи
pm2 monit                     # Мониторинг
pm2 reload stc-backend        # Обновление без даунтайма
```

### Nginx

```bash
sudo nginx -t                 # Проверка конфига
sudo systemctl reload nginx   # Перезагрузка
sudo systemctl restart nginx  # Перезапуск
```

### PostgreSQL

```bash
psql -U stc_user -d stc_transfer         # Подключение
sudo systemctl restart postgresql        # Перезапуск
```

### Git

```bash
git pull origin main          # Получить изменения
git status                    # Статус
git log --oneline            # История коммитов
```

---

## 🎯 Следующие шаги после развертывания

1. ✅ Проверить работу приложения: `./deploy-scripts/health-check.sh`
2. ✅ Настроить автоматические бэкапы: `./deploy-scripts/setup-cron-backup.sh`
3. ✅ Создать тестовый заказ через Telegram бота
4. ✅ Проверить админ-панель: `https://srs.faruk.io/admin`
5. ✅ Настроить мониторинг и алерты
6. ✅ Сохранить все пароли в безопасном месте
7. ✅ Обучить команду работе с системой

---

## 📞 Контакты и поддержка

- 📚 Документация: Этот репозиторий
- 🐛 Баги и проблемы: GitHub Issues
- 💬 Вопросы: Telegram

---

## 📌 Полезные ссылки

### Внешние ресурсы

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

### Инструменты

- [SSL Labs](https://www.ssllabs.com/ssltest/) - Проверка SSL
- [GTmetrix](https://gtmetrix.com/) - Проверка производительности
- [DigitalOcean](https://www.digitalocean.com/) - Хостинг
- [Hetzner](https://www.hetzner.com/) - Хостинг (дешевле)

---

**Версия документации:** 1.0  
**Последнее обновление:** Октябрь 2025  
**Целевая платформа:** Ubuntu 24.04 LTS
