/**
 * Простой прокси-сервер для обхода CORS при подключении к Wialon
 *
 * Установка:
 * npm install express http-proxy-middleware cors
 *
 * Запуск:
 * node wialon-proxy-server.js
 *
 * Использование:
 * Вместо http://176.74.220.111/wialon/ajax.html
 * Используйте http://localhost:3001/wialon/ajax.html
 */

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3005; // Изменен порт чтобы не конфликтовать с другими сервисами
const WIALON_SERVER = "gps.ent-en.com"; // Обновлен адрес сервера

// Включаем CORS для всех запросов
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", req.body);
  }
  next();
});

// Прокси для Wialon API
app.use(
  "/wialon",
  createProxyMiddleware({
    target: `http://${WIALON_SERVER}`,
    changeOrigin: true,
    secure: false,
    logLevel: "debug",
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Проксирование запроса к: http://${WIALON_SERVER}${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`Ответ от сервера: ${proxyRes.statusCode}`);

      // Добавляем CORS заголовки к ответу
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      proxyRes.headers["Access-Control-Allow-Methods"] =
        "GET, POST, PUT, DELETE, OPTIONS";
      proxyRes.headers["Access-Control-Allow-Headers"] =
        "Content-Type, Authorization, X-Requested-With";
    },
    onError: (err, req, res) => {
      console.error("Ошибка прокси:", err.message);
      res.status(500).json({
        error: "Proxy Error",
        message: err.message,
        target: `http://${WIALON_SERVER}${req.url}`,
      });
    },
  })
);

// Альтернативный прокси через другие порты
app.use(
  "/wialon8080",
  createProxyMiddleware({
    target: `http://${WIALON_SERVER}:8080`,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      "^/wialon8080": "/wialon",
    },
  })
);

app.use(
  "/wialon443",
  createProxyMiddleware({
    target: `http://${WIALON_SERVER}:443`,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      "^/wialon443": "/wialon",
    },
  })
);

// HTTPS прокси
app.use(
  "/wialons",
  createProxyMiddleware({
    target: `https://${WIALON_SERVER}`,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      "^/wialons": "/wialon",
    },
  })
);

// Статические файлы для тестирования
app.use("/test", express.static(path.join(__dirname)));

// Тестовая страница
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Wialon Proxy Server</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
            .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
            .btn:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <h1>🔄 Wialon Proxy Server</h1>
        <div class="status success">✅ Прокси-сервер запущен на порту ${PORT}</div>
        
        <h3>Доступные эндпоинты:</h3>
        <ul>
            <li><strong>Основной:</strong> <code>http://localhost:${PORT}/wialon/ajax.html</code></li>
            <li><strong>Порт 8080:</strong> <code>http://localhost:${PORT}/wialon8080/ajax.html</code></li>
            <li><strong>Порт 443:</strong> <code>http://localhost:${PORT}/wialon443/ajax.html</code></li>
            <li><strong>HTTPS:</strong> <code>http://localhost:${PORT}/wialons/ajax.html</code></li>
        </ul>

        <h3>Тестирование:</h3>
        <button class="btn" onclick="testConnection()">🧪 Тест подключения</button>
        <button class="btn" onclick="testLogin()">🔐 Тест авторизации</button>
        
        <div id="results"></div>

        <script>
            async function testConnection() {
                const results = document.getElementById('results');
                results.innerHTML = '<div class="status info">🔄 Тестирование подключения...</div>';
                
                try {
                    const response = await fetch('/wialon/ajax.html?svc=core/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'params=' + JSON.stringify({ user: 'test', password: 'test' })
                    });
                    
                    const data = await response.text();
                    results.innerHTML = '<div class="status success">✅ Подключение работает!</div><pre>' + data + '</pre>';
                } catch (error) {
                    results.innerHTML = '<div class="status error">❌ Ошибка: ' + error.message + '</div>';
                }
            }

            async function testLogin() {
                const results = document.getElementById('results');
                results.innerHTML = '<div class="status info">🔄 Тестирование авторизации...</div>';
                
                try {
                    const response = await fetch('/wialon/ajax.html?svc=core/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'params=' + JSON.stringify({ user: 'AKhamraev', password: 'xamrayev11' })
                    });
                    
                    const data = await response.json();
                    results.innerHTML = '<div class="status success">✅ Ответ получен!</div><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } catch (error) {
                    results.innerHTML = '<div class="status error">❌ Ошибка: ' + error.message + '</div>';
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Информация о сервере
app.get("/info", (req, res) => {
  res.json({
    server: "Wialon Proxy Server",
    port: PORT,
    target: WIALON_SERVER,
    endpoints: {
      main: `http://localhost:${PORT}/wialon/ajax.html`,
      port8080: `http://localhost:${PORT}/wialon8080/ajax.html`,
      port443: `http://localhost:${PORT}/wialon443/ajax.html`,
      https: `http://localhost:${PORT}/wialons/ajax.html`,
    },
    status: "running",
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log("🚀 Wialon Proxy Server запущен!");
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🎯 Цель: ${WIALON_SERVER}`);
  console.log("");
  console.log("📋 Доступные эндпоинты:");
  console.log(`   • Основной: http://localhost:${PORT}/wialon/ajax.html`);
  console.log(`   • Порт 8080: http://localhost:${PORT}/wialon8080/ajax.html`);
  console.log(`   • Порт 443: http://localhost:${PORT}/wialon443/ajax.html`);
  console.log(`   • HTTPS: http://localhost:${PORT}/wialons/ajax.html`);
  console.log("");
  console.log("🔧 Для использования в приложении измените baseUrl на:");
  console.log(`   http://localhost:${PORT}/wialon`);
  console.log("");
  console.log("⏹️  Для остановки нажмите Ctrl+C");
});

// Обработка завершения
process.on("SIGINT", () => {
  console.log("\n🛑 Остановка прокси-сервера...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Остановка прокси-сервера...");
  process.exit(0);
});
