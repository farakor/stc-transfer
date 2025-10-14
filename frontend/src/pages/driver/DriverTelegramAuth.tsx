import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { RefreshCw, AlertCircle, CheckCircle, User } from 'lucide-react';
import { api } from '@/services/api';

interface AuthState {
  status: 'loading' | 'authenticating' | 'success' | 'error';
  message: string;
}

const DriverTelegramAuth: React.FC = () => {
  const navigate = useNavigate();
  const { webApp, isReady, user, isInTelegram } = useTelegramWebApp();
  const [authState, setAuthState] = useState<AuthState>({
    status: 'loading',
    message: 'Инициализация...'
  });

  useEffect(() => {
    if (webApp && isReady) {
      try {
        webApp.ready();
        webApp.expand();
      } catch (error) {
        console.log('⚠️ Telegram WebApp methods not available:', error);
      }
    }
  }, [webApp, isReady]);

  useEffect(() => {
    // Проверяем, есть ли уже сохраненный водитель
    const savedDriver = localStorage.getItem('driver');
    const savedAuthToken = localStorage.getItem('driverAuthToken');

    if (savedDriver && savedAuthToken) {
      console.log('✅ Водитель уже авторизован');
      setAuthState({
        status: 'success',
        message: 'Вы уже авторизованы'
      });
      setTimeout(() => {
        navigate('/driver/dashboard');
      }, 1000);
      return;
    }

    // Если в Telegram и данные готовы, начинаем авторизацию
    if (isInTelegram && isReady && user) {
      authenticateDriver();
    } else if (!isInTelegram) {
      // Не в Telegram
      setAuthState({
        status: 'error',
        message: 'Это приложение работает только в Telegram'
      });
    }
  }, [isInTelegram, isReady, user, navigate]);

  const authenticateDriver = async () => {
    try {
      setAuthState({
        status: 'authenticating',
        message: 'Авторизация...'
      });

      const initData = webApp?.initData || '';
      const userData = user ? {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        photo_url: user.photo_url,
      } : null;

      console.log('🔐 Авторизация водителя через Telegram...');
      console.log('📝 Init Data:', initData);
      console.log('👤 User Data:', userData);

      const response = await api.post('/auth/driver/telegram', {
        initData,
        userData
      });

      if (response.data.success) {
        const { driver, authToken } = response.data.data;

        console.log('✅ Авторизация успешна');
        console.log('👤 Водитель:', driver);

        // Сохраняем данные водителя и токен
        localStorage.setItem('driver', JSON.stringify(driver));
        localStorage.setItem('driverAuthToken', authToken);

        setAuthState({
          status: 'success',
          message: `Добро пожаловать, ${driver.name}!`
        });

        // Переходим на дашборд через секунду
        setTimeout(() => {
          navigate('/driver/dashboard');
        }, 1500);
      } else {
        throw new Error(response.data.error || 'Ошибка авторизации');
      }
    } catch (error: any) {
      console.error('❌ Ошибка авторизации:', error);
      
      let errorMessage = 'Не удалось авторизоваться';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Если водитель не найден
      if (errorMessage.includes('not found') || errorMessage.includes('Please share your phone number')) {
        errorMessage = 'Водитель не найден. Пожалуйста, поделитесь номером телефона с ботом водителей (@stc_driver_bot).';
      }

      setAuthState({
        status: 'error',
        message: errorMessage
      });
    }
  };

  const handleRetry = () => {
    setAuthState({
      status: 'loading',
      message: 'Повторная попытка...'
    });
    setTimeout(() => {
      authenticateDriver();
    }, 500);
  };

  const getStatusIcon = () => {
    switch (authState.status) {
      case 'loading':
      case 'authenticating':
        return <RefreshCw className="w-16 h-16 text-gray-900 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-600" />;
      default:
        return <User className="w-16 h-16 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (authState.status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Иконка статуса */}
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>

        {/* Заголовок */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Авторизация водителя
        </h1>

        {/* Сообщение */}
        <p className={`text-base mb-6 ${getStatusColor()}`}>
          {authState.message}
        </p>

        {/* Информация о пользователе */}
        {user && authState.status !== 'error' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-3">
              {user.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt={user.first_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="text-left">
                <p className="font-medium text-gray-900">
                  {user.first_name} {user.last_name || ''}
                </p>
                {user.username && (
                  <p className="text-sm text-gray-500">@{user.username}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Кнопка повтора при ошибке */}
        {authState.status === 'error' && (
          <button
            onClick={handleRetry}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Попробовать снова
          </button>
        )}

        {/* Подсказка при ошибке */}
        {authState.status === 'error' && (
          <div className="mt-4 text-sm text-gray-600 text-left bg-blue-50 p-4 rounded-lg">
            <p className="font-medium text-blue-900 mb-2">💡 Что делать:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Откройте бот водителей в Telegram</li>
              <li>Отправьте команду /start</li>
              <li>Поделитесь номером телефона</li>
              <li>Вернитесь сюда и попробуйте снова</li>
            </ol>
          </div>
        )}

        {/* Индикатор загрузки */}
        {(authState.status === 'loading' || authState.status === 'authenticating') && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gray-900 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTelegramAuth;

