# 🚀 Начните здесь - Развертывание STC Transfer

> **Вся необходимая документация и скрипты для развертывания на Ubuntu 24 с доменом `srs.faruk.io`**

---

## 📚 Выберите свой путь

### 🎯 Я хочу быстро развернуть (опытные пользователи)

➡️ **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - 5 команд, ~15 минут

### 📖 Я хочу детальную инструкцию (рекомендуется)

➡️ **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Пошаговое руководство, ~1 час

### ✅ Я хочу использовать чеклист

➡️ **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Отмечайте галочками

### 🗺️ Я хочу увидеть полную карту документации

➡️ **[DEPLOYMENT_INDEX.md](DEPLOYMENT_INDEX.md)** - Навигация по всему

---

## 📦 Что включено?

### 📄 Документация (7 файлов)

- **DEPLOYMENT_GUIDE.md** - Полное руководство по развертыванию
- **QUICK_DEPLOY.md** - Быстрая версия для опытных
- **DEPLOYMENT_CHECKLIST.md** - Чеклист с галочками
- **DEPLOYMENT_INDEX.md** - Индекс всей документации
- **DEPLOYMENT_SUMMARY.md** - Резюме созданного
- **SYSTEM_REQUIREMENTS.md** - Требования к серверу
- **COMMANDS_CHEATSHEET.md** - Шпаргалка команд

### 🛠️ Скрипты (9 файлов)

Все в директории `deploy-scripts/`:

- `setup-server.sh` - Настройка сервера
- `setup-database.sh` - Создание БД
- `deploy.sh` - Развертывание/обновление
- `setup-ssl.sh` - SSL сертификат
- `setup-telegram-webhook.sh` - Telegram webhook
- `backup-db.sh` - Резервное копирование
- `restore-db.sh` - Восстановление БД
- `setup-cron-backup.sh` - Автоматические бэкапы
- `health-check.sh` - Проверка здоровья

### ⚙️ Конфигурационные файлы (4 файла)

- `deploy-scripts/nginx-config.conf` - Готовая конфигурация Nginx
- `ecosystem.config.js` - PM2 конфигурация
- `deploy-scripts/.env.backend.example` - Пример backend .env
- `deploy-scripts/.env.frontend.example` - Пример frontend .env

---

## ⚡ Минимальный быстрый старт

```bash
# 1. Настроить сервер
cd deploy-scripts && ./setup-server.sh

# 2. Создать БД
./setup-database.sh

# 3. Настроить .env файлы
# (скопируйте из примеров и заполните)

# 4. Настроить Nginx и SSL
sudo cp nginx-config.conf /etc/nginx/sites-available/srs.faruk.io
sudo ln -s /etc/nginx/sites-available/srs.faruk.io /etc/nginx/sites-enabled/
./setup-ssl.sh

# 5. Развернуть приложение
./deploy.sh

# 6. Настроить Telegram
./setup-telegram-webhook.sh

# 7. Проверить
./health-check.sh
```

---

## 📋 Что нужно подготовить?

### Технические

- [ ] Сервер Ubuntu 24.04 (2GB RAM, 20GB диск)
- [ ] Доступ по SSH
- [ ] DNS: `srs.faruk.io` → IP сервера

### Данные

- [ ] Telegram bot token
- [ ] Email для SSL
- [ ] Пароль для PostgreSQL

---

## 🎯 Ожидаемый результат

После развертывания у вас будет:

- ✅ https://srs.faruk.io - работающее приложение
- ✅ https://srs.faruk.io/admin - админ-панель
- ✅ Telegram боты отвечают
- ✅ SSL сертификат установлен
- ✅ Автоматические бэкапы настроены
- ✅ PM2 мониторинг работает

---

## 📖 Структура документации

```
📁 STC Transfer Deploy Docs
│
├── 🚀 START_HERE.md                    ← Вы здесь
│
├── 📚 Основная документация
│   ├── DEPLOYMENT_GUIDE.md             (Полное руководство)
│   ├── QUICK_DEPLOY.md                 (Быстрая версия)
│   ├── DEPLOYMENT_CHECKLIST.md         (Чеклист)
│   └── DEPLOYMENT_INDEX.md             (Навигация)
│
├── 📊 Справочная информация
│   ├── SYSTEM_REQUIREMENTS.md          (Требования)
│   ├── COMMANDS_CHEATSHEET.md          (Шпаргалка команд)
│   └── DEPLOYMENT_SUMMARY.md           (Резюме)
│
└── 🛠️ Скрипты и конфиги
    └── deploy-scripts/
        ├── README.md                   (Документация скриптов)
        ├── setup-*.sh                  (Скрипты настройки)
        ├── backup-*.sh                 (Скрипты бэкапов)
        ├── health-check.sh             (Проверка)
        └── *.example, *.conf           (Конфиги)
```

---

## 🔍 Быстрая навигация

### Для разных задач

| Задача                | Документ                                                                               |
| --------------------- | -------------------------------------------------------------------------------------- |
| Первое развертывание  | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)                                             |
| Быстрое развертывание | [QUICK_DEPLOY.md](QUICK_DEPLOY.md)                                                     |
| Проверить требования  | [SYSTEM_REQUIREMENTS.md](SYSTEM_REQUIREMENTS.md)                                       |
| Обновить приложение   | [DEPLOYMENT_INDEX.md#обновление](DEPLOYMENT_INDEX.md#обновление-приложения)            |
| Настроить бэкапы      | [DEPLOYMENT_GUIDE.md#резервное-копирование](DEPLOYMENT_GUIDE.md#резервное-копирование) |
| Решить проблемы       | [DEPLOYMENT_INDEX.md#диагностика](DEPLOYMENT_INDEX.md#диагностика-и-решение-проблем)   |
| Найти команду         | [COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)                                       |

---

## 💡 Рекомендации

### Для первого развертывания:

1. ⏰ Выделите 1-2 часа свободного времени
2. 📖 Прочитайте [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. ✅ Используйте [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
4. 🔍 Держите под рукой [COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)

### Для опытных:

1. ⚡ Используйте [QUICK_DEPLOY.md](QUICK_DEPLOY.md)
2. 🛠️ Запускайте скрипты из `deploy-scripts/`
3. 🏥 Проверяйте с помощью `health-check.sh`

---

## 🆘 Нужна помощь?

### Проверка системы

```bash
./deploy-scripts/health-check.sh
```

### Логи

```bash
pm2 logs stc-backend --lines 100
sudo tail -f /var/log/nginx/stc-error.log
```

### Решение проблем

- [DEPLOYMENT_INDEX.md - Диагностика](DEPLOYMENT_INDEX.md#диагностика-и-решение-проблем)
- [DEPLOYMENT_GUIDE.md - Частые проблемы](DEPLOYMENT_GUIDE.md#частые-проблемы-и-решения)

---

## ⏱️ Время развертывания

| Этап               | Время      |
| ------------------ | ---------- |
| Подготовка сервера | 10 мин     |
| Настройка БД       | 5 мин      |
| Конфигурация       | 10 мин     |
| Nginx и SSL        | 10 мин     |
| Развертывание      | 15 мин     |
| Telegram           | 2 мин      |
| Проверка           | 5 мин      |
| **Итого**          | **~1 час** |

_Последующие обновления: ~5 минут_

---

## 🎓 Дополнительно

### После развертывания

- 📊 Настройте мониторинг
- 💾 Проверьте бэкапы
- 🧪 Создайте тестовый заказ
- 👥 Обучите команду

### Полезные ссылки

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [PM2 Docs](https://pm2.keymetrics.io/docs/)

---

## 🎉 Готовы начать?

### Выберите один из вариантов:

1. **Детальное руководство** → [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. **Быстрое развертывание** → [QUICK_DEPLOY.md](QUICK_DEPLOY.md)
3. **Полная карта** → [DEPLOYMENT_INDEX.md](DEPLOYMENT_INDEX.md)

---

**Удачного развертывания! 🚀**

_Все необходимое уже подготовлено. Просто следуйте инструкциям!_
