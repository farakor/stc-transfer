import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Import routes
import vehicleRoutes from './routes/vehicles';
import bookingRoutes from './routes/bookings';
import userRoutes from './routes/users';
import routeRoutes from './routes/routes';
import adminRoutes from './routes/admin';
import adminAuthRoutes from './routes/adminAuth';
import driverRoutes from './routes/drivers';
import wialonRoutes from './routes/wialonRoutes';
import authRoutes from './routes/auth';
import trackingRoutes from './routes/tracking';
import publicTariffRoutes from './routes/publicTariffs';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { authenticate, authorize } from './middleware/auth';
import { AdminRole } from '@prisma/client';

// Import services
import { TelegramBotService } from './services/telegramBot';
import { DriverTelegramBotService } from './services/driverTelegramBot';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy - важно для работы за Nginx
app.set('trust proxy', true);

// Security middleware - отключаем строгий CSP для development
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://telegram.org", "https://*.telegram.org"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "http://localhost:*", "https://*.ngrok-free.app", "https://*.ngrok.io"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://telegram.org", "https://*.telegram.org"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting - более мягкие ограничения для development
const isDevelopment = process.env.NODE_ENV === 'development';

// Применяем rate limiting только в production или если явно указано
if (!isDevelopment || process.env.FORCE_RATE_LIMIT === 'true') {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 минут
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'); // 100 запросов
  
  const limiter = rateLimit({
    windowMs: windowMs,
    max: maxRequests,
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Возвращает rate limit info в заголовках `RateLimit-*`
    legacyHeaders: false, // Отключает заголовки `X-RateLimit-*`
  });
  
  app.use(limiter);
  console.log(`🛡️  Rate limiting enabled: ${maxRequests} requests per ${windowMs}ms`);
} else {
  console.log('🚧 Rate limiting disabled for development');
}

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3003'
];

console.log('🌐 CORS разрешенные домены:', allowedOrigins);

// Простое решение CORS - разрешаем все запросы
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
// Публичные маршруты для клиентов
app.use('/api/auth', authRoutes);

// Публичные маршруты для пользователей (Telegram бот)
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/routes', routeRoutes);

// Публичный роут для отслеживания транспорта (для Telegram WebApp)
app.use('/api/tracking', trackingRoutes);

// Публичный роут для тарифов (без авторизации, для просмотра клиентами)
app.use('/api/tariffs', publicTariffRoutes);

// Защищенные маршруты для водителей
app.use('/api/drivers', driverRoutes);

// Маршруты авторизации администраторов (публичный login + защищенные роуты)
app.use('/api/admin/auth', adminAuthRoutes);

// Защищенные админские маршруты (требуют аутентификацию и права администратора)
app.use('/api/admin', authenticate, authorize(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MANAGER), adminRoutes);
app.use('/api/wialon', authenticate, authorize(AdminRole.SUPER_ADMIN, AdminRole.ADMIN), wialonRoutes);

// Telegram webhook endpoints
// ВАЖНО: Более специфичный путь (/webhook/driver) должен быть ПЕРВЫМ!
app.use('/webhook/driver', (req, res, next) => {
  // Водительский бот (для водителей)
  console.log('🚗 Webhook /webhook/driver вызван');
  DriverTelegramBotService.getInstance().handleWebhook(req, res, next);
});

app.use('/webhook', (req, res, next) => {
  // Клиентский бот (для пассажиров)
  console.log('👤 Webhook /webhook вызван');
  TelegramBotService.getInstance().handleWebhook(req, res, next);
});

// Proxy для Frontend (Telegram Web App)
// Проксируем запросы к frontend приложению
const frontendProxy = createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  ws: true // proxy websockets для HMR
});

// Проксируем все non-API запросы к frontend
app.use('/', (req, res, next) => {
  // Если запрос к API, пропускаем
  if (req.path.startsWith('/api') || req.path.startsWith('/webhook') || req.path === '/health') {
    return next();
  }
  // Иначе проксируем к frontend
  frontendProxy(req, res, next);
});

// Error handling middleware (should be last)
app.use(notFound);
app.use(errorHandler);

// Initialize Telegram Bot Services
const telegramBot = TelegramBotService.getInstance();
const driverTelegramBot = DriverTelegramBotService.getInstance();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Telegram Bot initialized`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Webhook URL: ${process.env.TELEGRAM_WEBHOOK_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
