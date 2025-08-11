const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
    console.log('🔍 Тестирование API endpoints...\n');

    try {
        // 1. Тест создания заказа
        console.log('1️⃣ Создание тестового заказа...');
        const createResponse = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telegramId: 12345,
                fromLocation: 'Самарканд',
                toLocation: 'Ташкент',
                vehicleType: 'SEDAN',
                notes: 'Тестовый заказ из скрипта',
                distanceKm: 280
            })
        });

        const createResult = await createResponse.json();
        console.log('📝 Результат создания:', createResult);

        if (!createResult.success) {
            console.error('❌ Ошибка создания заказа');
            return;
        }

        console.log('✅ Заказ создан:', createResult.data.id);

        // 2. Тест получения активных заказов
        console.log('\n2️⃣ Получение активных заказов...');
        const activeResponse = await fetch(`${API_BASE}/bookings/active`);
        const activeResult = await activeResponse.json();
        
        console.log('📋 Активные заказы:', activeResult);
        
        if (activeResult.success && activeResult.data) {
            console.log(`✅ Найдено ${activeResult.data.length} активных заказов`);
            activeResult.data.forEach((booking, index) => {
                console.log(`   ${index + 1}. ID: ${booking.id.slice(0,8)}... | ${booking.fromLocation} → ${booking.toLocation} | Статус: ${booking.status}`);
            });
        } else {
            console.log('❌ Не удалось получить активные заказы');
        }

        // 3. Тест статистики
        console.log('\n3️⃣ Получение статистики...');
        const statsResponse = await fetch(`${API_BASE}/bookings/stats`);
        const statsResult = await statsResponse.json();
        
        console.log('📊 Статистика:', statsResult);

    } catch (error) {
        console.error('❌ Ошибка тестирования:', error.message);
    }
}

// Запуск тестов
testAPI();
