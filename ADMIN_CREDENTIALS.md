# 🔑 Учетные данные администраторов

## Активные администраторы

### 1. Farrukh Oripov (SUPER_ADMIN)

- **Email:** `farrukh.oripov@gmail.com`
- **Пароль:** `admin123`
- **Роль:** SUPER_ADMIN
- **Статус:** ✅ Активен

### 2. Admin User (SUPER_ADMIN)

- **Email:** `admin@stc.uz`
- **Пароль:** `admin123`
- **Роль:** SUPER_ADMIN
- **Статус:** ✅ Активен

## 🌐 Вход в админ-панель

1. Откройте: `http://localhost:3001/admin/login`
2. Введите email (НЕ "superadmin"!)
3. Введите пароль
4. Нажмите "Войти"

## ⚠️ Важно!

- **Используйте EMAIL**, а не логин типа "superadmin"
- Email: `farrukh.oripov@gmail.com` или `admin@stc.uz`
- Пароль: `admin123`

## 🛠️ Полезные команды

### Проверить пароль

```bash
cd backend
node check-password.js <email> <пароль>
```

Пример:

```bash
node check-password.js farrukh.oripov@gmail.com admin123
```

### Сбросить пароль

```bash
cd backend
node reset-password.js <email> <новый_пароль>
```

Пример:

```bash
node reset-password.js farrukh.oripov@gmail.com myNewPassword123
```

### Создать нового администратора

```bash
cd backend
node create-admin.js <email> <пароль> <имя> <фамилия> <роль>
```

Пример:

```bash
node create-admin.js manager@stc.uz password123 John Doe MANAGER
```

## 🔐 Роли администраторов

1. **SUPER_ADMIN** - полный доступ ко всему
2. **ADMIN** - управление заказами, водителями, автомобилями
3. **MANAGER** - просмотр и базовое управление заказами
4. **OPERATOR** - только просмотр данных

## 📝 Примечания

- Все пароли хешируются в базе данных
- Токены действительны 7 дней
- Неактивные администраторы не могут войти в систему

---

**Создано:** 13 октября 2025
