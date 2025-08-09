# STC Transfer - Telegram Web App

Telegram Web App для заказа трансферных услуг компании Samarkand Touristic Centre.

## 🚀 Быстрый запуск

### Предварительные требования

- Node.js 18+
- PostgreSQL 14+
- Docker и Docker Compose (опционально)

### Запуск с Docker (рекомендуется)

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd stc-transfer
```

2. **Создайте файлы окружения**
```bash
# Backend
cp backend/env.example backend/.env

# Отредактируйте backend/.env если необходимо
```

3. **Запустите приложение**
```bash
docker-compose up -d
```

4. **Инициализируйте базу данных**
```bash
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npm run db:seed
```

### Ручной запуск без Docker

1. **Установите зависимости**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Настройте базу данных**
```bash
# Создайте базу данных PostgreSQL
createdb stc_transfer

# Настройте переменные окружения
cp backend/env.example backend/.env
# Отредактируйте DATABASE_URL в .env

# Запустите миграции
cd backend
npx prisma migrate dev
npm run db:seed
```

3. **Запустите приложения**
```bash
# Терминал 1: Backend
cd backend
npm run dev

# Терминал 2: Frontend  
cd frontend
npm run dev

# Терминал 3: NGROK (для тестирования с Telegram)
ngrok http 3000 --domain=finer-legal-hedgehog.ngrok-free.app
```

## 🔗 Доступные URL

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/health
- **Database Admin**: http://localhost:8080 (только с Docker)
- **NGROK Public URL**: https://finer-legal-hedgehog.ngrok-free.app

## 📱 Тестирование Telegram Web App

1. **Настройте Telegram Bot**
   - Откройте [@BotFather](https://t.me/BotFather) в Telegram
   - Используйте токен: `8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns`
   - Настройте Web App URL: `https://finer-legal-hedgehog.ngrok-free.app`

2. **Запустите NGROK**
```bash
ngrok http 3000 --domain=finer-legal-hedgehog.ngrok-free.app
```

3. **Откройте бота в Telegram и нажмите кнопку Web App**

## 🛠️ Разработка

### Структура проекта

```
stc-transfer/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # API контроллеры
│   │   ├── services/        # Бизнес-логика
│   │   ├── routes/          # API маршруты
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Утилиты
│   ├── prisma/              # База данных схемы
│   └── package.json
├── frontend/                # React + TypeScript Web App
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── pages/           # Страницы приложения
│   │   ├── hooks/           # React хуки
│   │   ├── services/        # API сервисы
│   │   ├── types/           # TypeScript типы
│   │   └── utils/           # Утилиты
│   └── package.json
├── docker-compose.yml       # Docker конфигурация
└── README.md
```

### Доступные команды

**Backend:**
```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run start        # Запуск продакшен версии
npm run db:migrate   # Применить миграции
npm run db:studio    # Открыть Prisma Studio
npm run db:seed      # Заполнить тестовыми данными
```

**Frontend:**
```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run preview      # Предварительный просмотр сборки
npm run lint         # Проверка кода
```

### Переменные окружения

**Backend (.env):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/stc_transfer"
TELEGRAM_BOT_TOKEN="8426106323:AAEVqK3k3CI9oLAXq8Rcr1id6mF7EfQY4Ns"
TELEGRAM_WEBHOOK_URL="https://finer-legal-hedgehog.ngrok-free.app"
PORT=3001
NODE_ENV=development
JWT_SECRET="your-super-secret-jwt-key-here"
ALLOWED_ORIGINS="http://localhost:3000,https://finer-legal-hedgehog.ngrok-free.app"
```

## 🎨 Дизайн система

Проект использует дизайн в стиле топовых мобильных приложений:

- **Цвета**: Синий (#3b82f6), Зеленый (#22c55e), Оранжевый (#f97316)
- **Шрифты**: -apple-system, SF Pro, Roboto
- **Анимации**: Framer Motion для плавных переходов
- **UI**: Tailwind CSS с кастомными компонентами

## 📊 База данных

Проект использует PostgreSQL с Prisma ORM:

- **Users** - Пользователи Telegram
- **Vehicles** - Автомобили компании
- **Drivers** - Водители
- **Routes** - Маршруты и направления
- **Pricing** - Тарификация
- **Bookings** - Заказы трансфера

### Просмотр данных

```bash
# Prisma Studio
npm run db:studio

# Или через Adminer (с Docker)
open http://localhost:8080
```

## 🔧 API Endpoints

- `GET /health` - Проверка состояния сервера
- `GET /api/vehicles` - Список автомобилей
- `POST /api/bookings` - Создание заказа
- `GET /api/routes` - Доступные маршруты
- `POST /webhook` - Telegram Bot webhook

## 📱 Особенности Telegram Web App

- Интеграция с Telegram WebApp SDK
- Поддержка тем Telegram (светлая/тёмная)
- Адаптивный дизайн для мобильных устройств
- Haptic Feedback для iOS
- Main Button и Back Button интеграция

## 🚀 Развертывание

### Продакшен сборка

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Docker продакшен

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Вклад в проект

1. Форкните проект
2. Создайте ветку для функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📞 Поддержка

- **Telegram**: @stc_transfer_bot
- **Email**: [добавить email]
- **Документация**: [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

## 📄 Лицензия

Этот проект лицензирован под MIT License.

---

**Samarkand Touristic Centre** © 2024
