// Временные данные для пользователей
const MOCK_USERS = [
  {
    id: 1,
    telegram_id: '123456789',
    first_name: 'Иван',
    last_name: 'Иванов',
    username: 'ivanov',
    language_code: 'ru',
    phone: '+998901234567',
    name: 'Иван Иванов',
    created_at: new Date(),
    updated_at: new Date()
  }
]

export class UserServiceMock {
  // Найти пользователя по telegram_id
  static async findByTelegramId(telegramId: string) {
    let user = MOCK_USERS.find(u => u.telegram_id === telegramId)

    // Если пользователь не найден, создаем нового
    if (!user) {
      user = {
        id: MOCK_USERS.length + 1,
        telegram_id: telegramId,
        first_name: 'Пользователь',
        last_name: `#${telegramId}`,
        username: `user_${telegramId}`,
        language_code: 'ru',
        phone: '+998901234567',
        name: `Пользователь #${telegramId}`,
        created_at: new Date(),
        updated_at: new Date()
      }
      MOCK_USERS.push(user)
    }

    return user
  }

  // Создать пользователя
  static async create(data: any) {
    const user = {
      id: MOCK_USERS.length + 1,
      telegram_id: data.telegram_id,
      first_name: data.first_name || 'Пользователь',
      last_name: data.last_name || '',
      username: data.username || `user_${data.telegram_id}`,
      language_code: data.language_code || 'ru',
      phone: data.phone || '+998901234567',
      name: data.name || `${data.first_name || 'Пользователь'} ${data.last_name || ''}`.trim(),
      created_at: new Date(),
      updated_at: new Date()
    }

    MOCK_USERS.push(user)
    return user
  }
}
