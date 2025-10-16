# 🏗️ Архитектура развертывания STC Transfer

## Обзор системы

```
                                 Internet
                                    ↓
                            ┌───────────────┐
                            │  DNS Server   │
                            │ srs.faruk.io  │
                            └───────┬───────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │      Ubuntu 24.04 Server      │
                    │     IP: your-server-ip        │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │      Firewall (UFW)           │
                    │  Ports: 80, 443, 22           │
                    └───────────────┬───────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │   Nginx (Reverse Proxy)       │
                    │   + SSL/TLS (Let's Encrypt)   │
                    │   Port: 443 (HTTPS)           │
                    └───────┬───────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ↓                               ↓
    ┌──────────────┐              ┌──────────────────┐
    │   Frontend   │              │     Backend      │
    │  Static Files│              │   Node.js + PM2  │
    │ (Vite build) │              │   Port: 3001     │
    │              │              │   (Cluster: 2)   │
    └──────────────┘              └────────┬─────────┘
                                           │
                            ┌──────────────┼──────────────┐
                            ↓              ↓              ↓
                    ┌──────────────┐  ┌────────┐  ┌──────────────┐
                    │  PostgreSQL  │  │Socket.IO│  │   Telegram   │
                    │   Database   │  │WebSocket│  │  Bot API     │
                    │  Port: 5432  │  │         │  │  (Webhook)   │
                    └──────────────┘  └────────┘  └──────────────┘
```

---

## Детальная архитектура

### 1. Фронтенд слой (Frontend Layer)

```
┌─────────────────────────────────────────────────┐
│            Frontend Application                 │
├─────────────────────────────────────────────────┤
│  • React + TypeScript                          │
│  • Vite build system                           │
│  • Static files served by Nginx                │
│  • Location: /home/stc/apps/stc-transfer/      │
│              frontend/dist/                     │
│  • Cache: 1 year for assets                    │
│  • No cache for HTML                           │
└─────────────────────────────────────────────────┘
```

### 2. Прокси слой (Proxy Layer)

```
┌─────────────────────────────────────────────────┐
│              Nginx Reverse Proxy                │
├─────────────────────────────────────────────────┤
│  Routes:                                        │
│  • /              → Frontend (static files)    │
│  • /api           → Backend (port 3001)        │
│  • /socket.io     → WebSocket (port 3001)      │
│  • /api/telegram  → Telegram webhook           │
│                                                 │
│  Features:                                      │
│  • SSL/TLS termination                         │
│  • Gzip compression                            │
│  • Security headers                            │
│  • Request buffering                           │
│  • Access restrictions (Telegram IPs)          │
└─────────────────────────────────────────────────┘
```

### 3. Бэкенд слой (Backend Layer)

```
┌─────────────────────────────────────────────────┐
│          Backend Application (PM2)              │
├─────────────────────────────────────────────────┤
│  Instance 1              Instance 2             │
│  ┌─────────────┐        ┌─────────────┐        │
│  │ Express.js  │        │ Express.js  │        │
│  │ + TypeScript│        │ + TypeScript│        │
│  │             │        │             │        │
│  │ REST API    │        │ REST API    │        │
│  │ Socket.IO   │        │ Socket.IO   │        │
│  │ Telegram Bot│        │ Telegram Bot│        │
│  └─────────────┘        └─────────────┘        │
│                                                 │
│  • Cluster mode (2 instances)                  │
│  • Auto-restart on crash                       │
│  • Memory limit: 500MB per instance            │
│  • Load balancing by PM2                       │
└─────────────────────────────────────────────────┘
```

### 4. База данных (Database Layer)

```
┌─────────────────────────────────────────────────┐
│            PostgreSQL Database                  │
├─────────────────────────────────────────────────┤
│  Database: stc_transfer                        │
│  User: stc_user                                │
│  Port: 5432 (localhost only)                   │
│                                                 │
│  Tables:                                        │
│  • User (пользователи)                         │
│  • Driver (водители)                           │
│  • Vehicle (автомобили)                        │
│  • Booking (заказы)                            │
│  • Admin (администраторы)                      │
│  • Route, Location, Tariff, etc.              │
│                                                 │
│  Migrations: Prisma                            │
│  Backups: Daily at 02:00                       │
└─────────────────────────────────────────────────┘
```

### 5. Внешние интеграции

```
┌─────────────────────────────────────────────────┐
│          External Integrations                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Telegram Bot API                               │
│  ├── Client Bot (основной)                     │
│  └── Driver Bot (водительский)                 │
│                                                 │
│  Webhook: https://srs.faruk.io/api/telegram/   │
│  Updates: message, callback_query              │
│                                                 │
│  Optional:                                      │
│  └── Wialon API (tracking)                     │
└─────────────────────────────────────────────────┘
```

---

## Потоки данных (Data Flow)

### 1. Пользователь создает заказ через Telegram

```
[Telegram User] → [Telegram Bot API]
                        ↓
                   (Webhook)
                        ↓
            [Nginx] → [Backend API]
                        ↓
                  [PostgreSQL]
                        ↓
                  [Socket.IO]
                        ↓
            [Admin Dashboard] (real-time update)
```

### 2. Администратор управляет заказами

```
[Admin Browser] → [Frontend SPA]
                        ↓
                   (HTTPS/443)
                        ↓
            [Nginx] → [Backend API]
                        ↓
                  [PostgreSQL]
                        ↓
                [Telegram Bot API]
                        ↓
            [Driver Telegram] (уведомление)
```

### 3. WebSocket real-time обновления

```
[Admin Dashboard] ←→ [Socket.IO] ←→ [Backend]
                                        ↓
                                  [Database Events]
```

---

## Файловая структура на сервере

```
/home/stc/
│
├── apps/
│   └── stc-transfer/
│       ├── backend/
│       │   ├── .env                    (конфигурация)
│       │   ├── dist/                   (скомпилированный код)
│       │   ├── node_modules/           (зависимости)
│       │   ├── prisma/                 (схема БД)
│       │   └── src/                    (исходный код)
│       │
│       ├── frontend/
│       │   ├── .env.production         (конфигурация)
│       │   ├── dist/                   (собранный frontend)
│       │   └── node_modules/
│       │
│       ├── logs/
│       │   ├── backend-out.log
│       │   └── backend-error.log
│       │
│       ├── deploy-scripts/             (скрипты развертывания)
│       └── ecosystem.config.js         (PM2 конфигурация)
│
└── backups/
    └── postgres/
        ├── backup_20251016_020000.sql.gz
        ├── backup_20251015_020000.sql.gz
        └── ...
```

---

## Порты и сетевая конфигурация

### Открытые порты (Firewall)

```
Port 22   → SSH (защищен ключами)
Port 80   → HTTP (redirect to HTTPS)
Port 443  → HTTPS (Nginx)
```

### Внутренние порты (localhost only)

```
Port 3001 → Backend API
Port 5432 → PostgreSQL
```

### Сетевой поток

```
Internet (443) → Nginx → Backend (3001) → PostgreSQL (5432)
                  ↓
            Frontend (static)
```

---

## Процессы и сервисы

### Системные сервисы

```
┌──────────────────────────────────────────────┐
│ systemd                                      │
├──────────────────────────────────────────────┤
│ • nginx.service         (Nginx)             │
│ • postgresql.service    (PostgreSQL)        │
│ • certbot.timer         (SSL auto-renew)    │
└──────────────────────────────────────────────┘
```

### PM2 процессы

```
┌──────────────────────────────────────────────┐
│ PM2                                          │
├──────────────────────────────────────────────┤
│ • stc-backend (instance 1)                  │
│ • stc-backend (instance 2)                  │
└──────────────────────────────────────────────┘
```

---

## Безопасность (Security Layers)

### 1. Сетевая безопасность

```
┌─────────────────────────────────────────┐
│        UFW Firewall                     │
│  Only ports: 22, 80, 443 open          │
└─────────────────────────────────────────┘
```

### 2. SSL/TLS

```
┌─────────────────────────────────────────┐
│     Let's Encrypt SSL Certificate       │
│  • TLS 1.2/1.3                          │
│  • Auto-renewal every 90 days           │
│  • Strong cipher suites                 │
└─────────────────────────────────────────┘
```

### 3. Приложение

```
┌─────────────────────────────────────────┐
│      Application Security               │
│  • JWT authentication                   │
│  • Rate limiting                        │
│  • CORS policy                          │
│  • Helmet.js security headers          │
│  • Input validation (Zod)              │
└─────────────────────────────────────────┘
```

### 4. База данных

```
┌─────────────────────────────────────────┐
│       Database Security                 │
│  • Localhost only access               │
│  • Strong password                      │
│  • Separate user (not postgres)        │
│  • Daily backups                        │
└─────────────────────────────────────────┘
```

### 5. Telegram Webhook

```
┌─────────────────────────────────────────┐
│     Telegram Webhook Security           │
│  • IP whitelist (Telegram servers)     │
│  • HTTPS only                           │
│  • Token in request                     │
└─────────────────────────────────────────┘
```

---

## Мониторинг и логирование

### Уровни логирования

```
Application Layer
    ├── PM2 logs           → ~/apps/stc-transfer/logs/
    ├── Console output     → pm2 logs stc-backend
    └── Error tracking     → backend-error.log

Proxy Layer
    ├── Access logs        → /var/log/nginx/stc-access.log
    └── Error logs         → /var/log/nginx/stc-error.log

Database Layer
    └── PostgreSQL logs    → /var/log/postgresql/

System Layer
    └── System journal     → journalctl
```

### Метрики

```
PM2 Monitoring
    ├── CPU usage
    ├── Memory usage
    ├── Restart count
    └── Uptime

System Monitoring
    ├── Disk space (df -h)
    ├── Memory (free -h)
    ├── CPU load (uptime)
    └── Network (netstat)
```

---

## Резервное копирование (Backup Strategy)

```
Daily Backups (02:00)
    ├── Database dump (compressed)
    ├── Retention: 7 days
    └── Location: ~/backups/postgres/

Manual Backups
    ├── Before updates
    ├── Before migrations
    └── On demand

Backup Contents
    ├── Database schema
    ├── All tables and data
    └── Compressed with gzip
```

---

## Обновление и масштабирование

### Процесс обновления

```
1. Бэкап базы данных
2. Git pull / загрузка новой версии
3. Установка зависимостей (npm install)
4. Миграции БД (prisma migrate deploy)
5. Сборка (npm run build)
6. PM2 reload (zero-downtime)
7. Проверка health-check
```

### Горизонтальное масштабирование

```
                Load Balancer (Nginx)
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    Server 1        Server 2        Server 3
    (Backend)       (Backend)       (Backend)
        ↓               ↓               ↓
            Database (Master-Slave)
```

---

## Производительность

### Оптимизации

- PM2 cluster mode (2+ инстансы)
- Nginx gzip compression
- PostgreSQL индексы
- Static файлы кеширование (1 год)
- Connection pooling (PostgreSQL)
- Keep-alive соединения

### Узкие места (Bottlenecks)

1. Database queries (решение: индексы, оптимизация запросов)
2. Memory usage (решение: увеличение RAM, оптимизация кода)
3. Network I/O (решение: CDN, compression)

---

## Disaster Recovery

### Критические сценарии

1. **Backend сбой**

   ```
   PM2 автоматически перезапустит
   Если не помогло: pm2 restart stc-backend
   ```

2. **База данных недоступна**

   ```
   1. systemctl restart postgresql
   2. Если не помогло: восстановление из бэкапа
   ```

3. **Nginx сбой**

   ```
   1. nginx -t (проверка конфига)
   2. systemctl restart nginx
   ```

4. **Полный сбой сервера**
   ```
   1. Новый сервер
   2. Восстановление из бэкапа
   3. Повторное развертывание
   ```

---

## Контакты и документация

- **Полное руководство**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Быстрый старт**: [START_HERE.md](START_HERE.md)
- **Системные требования**: [SYSTEM_REQUIREMENTS.md](SYSTEM_REQUIREMENTS.md)
- **Команды**: [COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)

---

_Эта архитектура обеспечивает надежность, безопасность и масштабируемость приложения STC Transfer._
