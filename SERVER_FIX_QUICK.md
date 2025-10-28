# 🔧 БЫСТРОЕ ИСПРАВЛЕНИЕ НА СЕРВЕРЕ

## Проблема
Локально работает, но на сервере карта Wialon не отображается после git pull.

## Причина
**Файл `.env` не обновился, потому что он в `.gitignore` и не коммитится в git!**

## ✅ Решение (выполните на сервере)

### Вариант 1: Автоматический (рекомендуется)

```bash
# Подключитесь к серверу по SSH
ssh your-server

# Перейдите в директорию проекта
cd /path/to/stc-transfer

# Подтяните изменения из GitHub (если еще не сделали)
git pull

# Запустите скрипт обновления
./update-wialon-on-server.sh
```

### Вариант 2: Ручной (если скрипт не работает)

```bash
# 1. Обновите .env файл
nano backend/.env

# Найдите строку:
# WIALON_BASE_URL="https://gps.ent-en.com/wialon"

# Замените на:
# WIALON_BASE_URL="http://176.74.220.111/wialon"

# Сохраните: Ctrl+O, Enter, Ctrl+X

# 2. Пересоберите frontend
cd frontend
npm run build
cd ..

# 3. Перезапустите сервисы
pm2 restart all

# 4. Перезагрузите nginx (если используете)
sudo systemctl reload nginx
```

### Вариант 3: Одной командой через sed

```bash
# Быстрое обновление .env одной командой
sed -i 's|WIALON_BASE_URL="https://gps.ent-en.com/wialon"|WIALON_BASE_URL="http://176.74.220.111/wialon"|g' backend/.env

# Также замените если был http с доменом
sed -i 's|WIALON_BASE_URL="http://gps.ent-en.com/wialon"|WIALON_BASE_URL="http://176.74.220.111/wialon"|g' backend/.env

# Проверьте результат
grep WIALON_BASE_URL backend/.env

# Пересоберите и перезапустите
cd frontend && npm run build && cd .. && pm2 restart all
```

## 🔍 Проверка

После выполнения команд:

```bash
# 1. Проверьте что .env обновлен
grep WIALON_BASE_URL backend/.env
# Должно быть: WIALON_BASE_URL="http://176.74.220.111/wialon"

# 2. Проверьте что процессы перезапустились
pm2 status

# 3. Проверьте логи на ошибки
pm2 logs backend --lines 20

# 4. Проверьте доступность Wialon с сервера
curl -v http://176.74.220.111/wialon/ajax.html
```

## 📱 Проверка в браузере

1. Откройте админ панель: `https://your-domain.com/admin`
2. Нажмите **Ctrl+F5** (жесткая перезагрузка) - **ОБЯЗАТЕЛЬНО!**
3. Откройте консоль (F12)
4. Должны увидеть:
   ```
   ✅ Wialon JSONP connected: { sid: '...', userName: '...', ... }
   ```

## ❗ Важно

1. **Очистите кэш браузера** - обязательно Ctrl+F5 или Cmd+Shift+R
2. **Проверьте .env** - это самая частая причина проблемы
3. **Пересоберите frontend** - изменения в конфигурации не применятся без rebuild
4. **Перезапустите процессы** - backend должен перечитать .env

## 🐛 Если не помогло

```bash
# 1. Проверьте frontend конфигурацию
grep "baseUrl:" frontend/src/config/wialon.config.ts | grep -v "//"

# 2. Проверьте backend конфигурацию  
grep "baseUrl:" backend/src/services/wialonService.ts

# 3. Проверьте что git pull прошел успешно
git status
git log -1

# 4. Проверьте доступность Wialon с сервера
curl http://176.74.220.111/wialon/ajax.html

# 5. Посмотрите полные логи
pm2 logs backend --lines 50
```

## 📞 Альтернатива

Если IP адрес 176.74.220.111 недоступен с вашего сервера, используйте прокси:

```bash
# Запустите прокси-сервер
node wialon-proxy-server.js &

# Обновите .env
echo 'WIALON_BASE_URL="http://localhost:3005/wialon"' >> backend/.env

# Перезапустите
pm2 restart all
```

---

**Главное:** Не забудьте очистить кэш браузера (Ctrl+F5)!

