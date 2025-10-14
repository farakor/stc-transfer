import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, LogIn, AlertCircle } from 'lucide-react';
import Logo from '@/assets/STC-transfer.svg';
import FarukBadge from '@/assets/faruk-badge.svg';

interface LoginResponse {
  success: boolean;
  data?: {
    id: number;
    name: string;
    phone: string;
    license: string;
    status: string;
    vehicle: any;
    activeBookings: any[];
  };
  error?: string;
}

const DriverLogin: React.FC = () => {
  const [phone, setPhone] = useState('+998 ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formatPhone = (value: string) => {
    // Убираем все нецифровые символы
    const numbers = value.replace(/\D/g, '');
    
    // Всегда начинаем с 998, берем только цифры после 998
    const phoneDigits = numbers.startsWith('998') ? numbers.slice(3) : numbers;
    
    // Форматируем как +998 xx-xxx-xx-xx
    if (phoneDigits.length === 0) return '+998 ';
    if (phoneDigits.length <= 2) return `+998 ${phoneDigits}`;
    if (phoneDigits.length <= 5) return `+998 ${phoneDigits.slice(0, 2)}-${phoneDigits.slice(2)}`;
    if (phoneDigits.length <= 7) return `+998 ${phoneDigits.slice(0, 2)}-${phoneDigits.slice(2, 5)}-${phoneDigits.slice(5)}`;
    return `+998 ${phoneDigits.slice(0, 2)}-${phoneDigits.slice(2, 5)}-${phoneDigits.slice(5, 7)}-${phoneDigits.slice(7, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Если пользователь пытается удалить +998, возвращаем минимальное значение
    if (!input.startsWith('+998')) {
      setPhone('+998 ');
      if (error) setError('');
      return;
    }
    
    const formatted = formatPhone(input);
    setPhone(formatted);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 17) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/drivers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, '') // Отправляем только цифры
        }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // Сохраняем данные водителя в localStorage
        localStorage.setItem('driver', JSON.stringify(data.data));
        navigate('/driver/dashboard');
      } else {
        setError(data.error || 'Водитель с таким номером не найден');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <img src={Logo} alt="STC Transfer" className="w-24 h-24" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Вход для водителей
          </h1>
          <p className="text-gray-600">
            Введите номер телефона для входа в систему
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Номер телефона
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 __-___-__-__"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-gray-900 font-semibold text-lg placeholder:text-gray-400 placeholder:font-normal"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !phone || phone.length < 17}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Вход...</span>
              </div>
            ) : (
              'Войти'
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-500">
            Если у вас нет доступа, обратитесь к диспетчеру
          </p>
          
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-2">Developed by</p>
            <img src={FarukBadge} alt="Faruk" className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;
