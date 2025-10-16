# 📊 Системные требования STC Transfer

## Минимальные требования

### Сервер

- **ОС**: Ubuntu 24.04 LTS (рекомендуется) или Ubuntu 22.04 LTS
- **CPU**: 1 vCPU (2 ядра рекомендуется)
- **RAM**: 2 GB (4 GB рекомендуется)
- **Диск**: 20 GB SSD (50 GB рекомендуется)
- **Сеть**: 100 Mbps (1 Gbps рекомендуется)
- **IP**: Статический IP адрес

### Программное обеспечение

- **Node.js**: 20.x LTS
- **PostgreSQL**: 14+ (16 рекомендуется)
- **Nginx**: 1.24+
- **PM2**: 5.x
- **Git**: 2.x

---

## Рекомендуемые характеристики для продакшена

### Для малой нагрузки (до 100 пользователей/день)

- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Диск**: 50 GB SSD
- **Bandwidth**: 500 GB/месяц

### Для средней нагрузки (100-1000 пользователей/день)

- **CPU**: 4 vCPU
- **RAM**: 8 GB
- **Диск**: 100 GB SSD
- **Bandwidth**: 2 TB/месяц

### Для высокой нагрузки (1000+ пользователей/день)

- **CPU**: 8+ vCPU
- **RAM**: 16+ GB
- **Диск**: 200+ GB SSD
- **Bandwidth**: 5+ TB/месяц
- **Дополнительно**: Load Balancer, Database Replication

---

## Оценка ресурсов

### Backend (Node.js + Express)

- **RAM**: ~200-300 MB на инстанс
- **CPU**: Средняя нагрузка 10-30%
- **Инстансы PM2**: 2-4 (кластерный режим)

### Frontend (Static Files)

- **Размер**: ~10-20 MB
- **Nginx**: ~10-20 MB RAM

### PostgreSQL

- **RAM**: 256 MB - 2 GB (зависит от нагрузки)
- **Диск**: Зависит от количества заказов
  - 1000 заказов ≈ 1-2 MB
  - 100,000 заказов ≈ 100-200 MB

### WebSocket (Socket.IO)

- **Соединения**: ~1 MB RAM на 100 активных соединений
- **Bandwidth**: ~1 KB/сек на соединение

---

## Оценка дискового пространства

### Базовая установка

```
/home/stc/apps/stc-transfer/
├── backend/               ~500 MB (node_modules)
├── frontend/              ~300 MB (node_modules)
└── logs/                  ~100 MB/месяц (с ротацией)

Итого: ~1 GB
```

### База данных

```
PostgreSQL:
- Пустая БД:              ~10 MB
- 1,000 заказов:          ~2 MB
- 10,000 заказов:         ~20 MB
- 100,000 заказов:        ~200 MB

Резервные копии (compressed):
- 1 бэкап:                ~1-5 MB (зависит от данных)
- 30 дней бэкапов:        ~30-150 MB
```

### Логи

```
Application logs:         ~10-50 MB/месяц
Nginx logs:               ~50-200 MB/месяц
PostgreSQL logs:          ~10-50 MB/месяц

С ротацией (30 дней):     ~200-500 MB
```

---

## Производительность

### Backend API

- **Throughput**: ~1000 req/sec (на 2 vCPU)
- **Response time**:
  - GET запросы: 10-50 ms
  - POST запросы: 50-200 ms
  - Database queries: 10-100 ms

### WebSocket

- **Concurrent connections**: ~10,000 (на 4 GB RAM)
- **Message latency**: <100 ms

### Database

- **Queries/sec**: ~500-1000 (простые запросы)
- **Connection pool**: 10-20 соединений

---

## Сетевые требования

### Bandwidth

- **Backend API**: ~1 KB/запрос
- **Frontend**: ~1-2 MB первая загрузка, ~50-100 KB последующие
- **WebSocket**: ~1-5 KB/сек на соединение
- **Telegram Bot**: ~10-50 KB/сообщение

### Оценка трафика

```
100 пользователей/день:
- API запросы:            ~50 MB/день
- WebSocket:              ~100 MB/день
- Frontend:               ~200 MB/день
- Telegram:               ~50 MB/день
Итого:                    ~400 MB/день (~12 GB/месяц)

1000 пользователей/день:  ~120 GB/месяц
10000 пользователей/день: ~1.2 TB/месяц
```

### Порты

- **80**: HTTP (redirect to HTTPS)
- **443**: HTTPS (Nginx)
- **3001**: Backend (internal, localhost only)
- **5432**: PostgreSQL (internal, localhost only)

---

## Рекомендации по облачным провайдерам

### DigitalOcean Droplets

- **Basic**: $24/мес (2 vCPU, 4 GB RAM, 80 GB SSD) ⭐ Рекомендуется
- **Standard**: $48/мес (2 vCPU, 8 GB RAM, 160 GB SSD)
- **Premium**: $96/мес (4 vCPU, 16 GB RAM, 320 GB SSD)

### AWS EC2

- **t3.medium**: ~$30/мес (2 vCPU, 4 GB RAM)
- **t3.large**: ~$60/мес (2 vCPU, 8 GB RAM)
- **m5.large**: ~$70/мес (2 vCPU, 8 GB RAM)

### Hetzner Cloud

- **CPX21**: €10/мес (3 vCPU, 4 GB RAM, 80 GB SSD) ⭐ Лучшая цена
- **CPX31**: €17/мес (4 vCPU, 8 GB RAM, 160 GB SSD)

### Vultr

- **Regular Performance**: $24/мес (2 vCPU, 4 GB RAM, 80 GB SSD)
- **High Frequency**: $48/мес (2 vCPU, 8 GB RAM, 128 GB NVMe)

### Linode

- **Linode 4GB**: $24/мес (2 vCPU, 4 GB RAM, 80 GB SSD)
- **Linode 8GB**: $48/мес (4 vCPU, 8 GB RAM, 160 GB SSD)

---

## Оптимизация производительности

### Backend

```javascript
// ecosystem.config.js
{
  instances: 2,  // Используйте 2-4 инстанса
  exec_mode: 'cluster',
  max_memory_restart: '500M'
}
```

### Nginx

```nginx
# Кеширование статики
location ~* \.(js|css|png|jpg|jpeg|gif|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip compression
gzip on;
gzip_comp_level 6;
```

### PostgreSQL

```sql
-- Оптимизация для 4 GB RAM
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 16MB
```

### PM2

```bash
# Ограничение памяти
pm2 start ecosystem.config.js --max-memory-restart 500M

# Мониторинг
pm2 monit
```

---

## Мониторинг ресурсов

### CPU

```bash
# Текущая нагрузка
top
htop

# История
sar -u 1 10

# PM2
pm2 monit
```

### Memory

```bash
# Использование памяти
free -h

# По процессам
ps aux --sort=-%mem | head

# PM2
pm2 status
```

### Disk

```bash
# Свободное место
df -h

# Использование по директориям
du -sh /home/stc/apps/*

# I/O статистика
iostat -x 1 10
```

### Network

```bash
# Текущие соединения
netstat -an | grep ESTABLISHED | wc -l

# Bandwidth
iftop

# Текущий трафик
nload
```

---

## Масштабирование

### Вертикальное (увеличение ресурсов)

1. Увеличить RAM и CPU сервера
2. Увеличить количество PM2 инстансов
3. Оптимизировать PostgreSQL настройки

### Горизонтальное (добавление серверов)

1. **Load Balancer**: Nginx + несколько backend серверов
2. **Database Replication**: Master-Slave PostgreSQL
3. **Redis**: Для кеширования и сессий
4. **CDN**: Для статических файлов frontend

### Пример архитектуры для высокой нагрузки

```
Internet
    ↓
Load Balancer (Nginx)
    ↓
┌───────┬───────┬───────┐
│ App 1 │ App 2 │ App 3 │ (Backend Servers)
└───────┴───────┴───────┘
    ↓           ↓
PostgreSQL   Redis
(Master)     (Cache)
    ↓
PostgreSQL
(Replica)
```

---

## Чеклист оптимизации

### Перед запуском

- [ ] PM2 в кластерном режиме (2-4 инстанса)
- [ ] Nginx gzip compression включен
- [ ] PostgreSQL настроен для доступной RAM
- [ ] Настроена ротация логов
- [ ] Настроены индексы в БД

### Регулярное обслуживание

- [ ] Мониторинг дискового пространства (еженедельно)
- [ ] Очистка старых логов (ежемесячно)
- [ ] Проверка производительности БД (ежемесячно)
- [ ] Обновление зависимостей (ежемесячно)
- [ ] Проверка резервных копий (еженедельно)

### При росте нагрузки

- [ ] Увеличить RAM/CPU
- [ ] Добавить индексы в БД
- [ ] Настроить Redis для кеширования
- [ ] Рассмотреть CDN для статики
- [ ] Рассмотреть load balancer

---

## Дополнительные рекомендации

### Для продакшена обязательно:

1. ✅ SSL сертификат (Let's Encrypt)
2. ✅ Firewall (UFW)
3. ✅ Автоматические бэкапы БД
4. ✅ Мониторинг (PM2, логи)
5. ✅ Ротация логов
6. ✅ PM2 автозапуск

### Опционально, но рекомендуется:

1. Redis для кеширования
2. Fail2ban для защиты
3. Monitoring (Prometheus + Grafana)
4. Alerting (email/Telegram при сбоях)
5. CDN (Cloudflare)
6. Database replication
7. Automated backups to S3/Object Storage

---

Для получения текущей статистики использования ресурсов:

```bash
# Быстрая проверка
pm2 status && free -h && df -h

# Детальный мониторинг
pm2 monit
```
