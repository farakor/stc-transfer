// PM2 конфигурация для STC Transfer
// Запуск: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "stc-backend",
      // Путь к главному файлу приложения
      cwd: "/home/stc/apps/stc-transfer/backend",
      script: "dist/index.js",

      // Режим кластера для балансировки нагрузки
      instances: 2, // или 'max' для использования всех ядер CPU
      exec_mode: "cluster",

      // Переменные окружения
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },

      // Логи
      error_file: "/home/stc/apps/stc-transfer/logs/backend-error.log",
      out_file: "/home/stc/apps/stc-transfer/logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // Автоматический перезапуск
      autorestart: true,
      max_memory_restart: "500M", // Перезапуск при превышении памяти

      // Отслеживание изменений файлов (для разработки, в продакшене обычно false)
      watch: false,
      ignore_watch: ["node_modules", "logs", "*.log", ".git"],

      // Задержка между перезапусками при сбоях
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,

      // Дополнительные настройки для Node.js
      node_args: "--max-old-space-size=1024",

      // Cron для перезапуска (опционально, например, каждую ночь в 3:00)
      // cron_restart: '0 3 * * *',

      // Время ожидания перед повторным запуском после сбоя
      exp_backoff_restart_delay: 100,
    },
  ],

  // Настройки развертывания (опционально)
  deploy: {
    production: {
      user: "stc",
      host: "your-server-ip",
      ref: "origin/main",
      repo: "git@github.com:username/stc-transfer.git",
      path: "/home/stc/apps/stc-transfer",
      "post-deploy":
        "cd backend && npm install && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-deploy-local": "",
      "post-setup":
        "cd backend && npm install && npm run db:generate && npm run build",
    },
  },
};
