import React, { useState, useEffect } from 'react';
import LicensePlate from './LicensePlate';

interface LicensePlateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const LicensePlateInput: React.FC<LicensePlateInputProps> = ({
  value,
  onChange,
  placeholder = "01 A123BC",
  className = '',
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const formatLicensePlate = (input: string) => {
    // Убираем все символы кроме букв и цифр
    const clean = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Форматируем: первый блок 2 цифры, второй блок до 6 цифр/букв
    let formatted = '';

    if (clean.length >= 1) {
      formatted += clean.substring(0, 2); // Территориальный код (2 цифры)
    }
    if (clean.length >= 3) {
      formatted += ' ' + clean.substring(2, 8); // Серия и номер (до 6 символов)
    }

    return formatted;
  };

  const validateLicensePlate = (input: string) => {
    // Проверяем формат: 2 цифры, пробел, до 6 цифр/букв
    const pattern = /^\d{2}(\s[A-Z0-9]{1,6})?$/;
    return pattern.test(input) || input === '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatLicensePlate(rawValue);
    const valid = validateLicensePlate(formatted);

    setInputValue(formatted);
    setIsValid(valid);
    onChange(formatted);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Разрешаем только цифры, буквы и управляющие клавиши
    const allowedKeys = /[0-9A-Za-z\s]/;
    const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];

    if (!allowedKeys.test(e.key) && !controlKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-2">
      {/* Поле ввода */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={9} // "01 A123BC" = 9 символов
          className={`
            w-full px-3 py-2 border rounded-md font-mono text-center
            ${isValid
              ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              : 'border-red-300 focus:border-red-500 focus:ring-red-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-1
            ${className}
          `}
        />

        {/* Индикатор валидности */}
        {inputValue && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            ) : (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
        )}
      </div>

      {/* Превью госномера */}
      {inputValue && isValid && (
        <div className="flex justify-center">
          <LicensePlate plateNumber={inputValue} size="medium" />
        </div>
      )}

      {/* Сообщение об ошибке */}
      {inputValue && !isValid && (
        <p className="text-xs text-red-600 text-center">
          Формат: 01 A123BC (2 цифры, до 6 цифр/букв)
        </p>
      )}

      {/* Подсказка */}
      {!inputValue && (
        <p className="text-xs text-gray-500 text-center">
          Пример: 01 A123BC
        </p>
      )}
    </div>
  );
};

export default LicensePlateInput;
