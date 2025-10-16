import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface SlideToStartProps {
  onComplete: () => void;
  disabled?: boolean;
  text?: string;
  className?: string;
  vibrate?: boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
      };
    };
  }
}

export const SlideToStart: React.FC<SlideToStartProps> = ({
  onComplete,
  disabled = false,
  text = 'Свайп для начала рейса',
  className = '',
  vibrate = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const maxPositionRef = useRef(0);

  useEffect(() => {
    if (containerRef.current && sliderRef.current) {
      maxPositionRef.current = containerRef.current.offsetWidth - sliderRef.current.offsetWidth;
    }
  }, []);

  const handleStart = (clientX: number) => {
    if (disabled || isCompleted) return;
    setIsDragging(true);
    startXRef.current = clientX - position;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled || isCompleted) return;

    const newPosition = clientX - startXRef.current;
    const clampedPosition = Math.max(0, Math.min(newPosition, maxPositionRef.current));
    setPosition(clampedPosition);

    // Проверяем, достиг ли слайдер конца
    if (clampedPosition >= maxPositionRef.current * 0.9) {
      complete();
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Если не достиг конца, возвращаем в начало
    if (position < maxPositionRef.current * 0.9) {
      setPosition(0);
    }
  };

  const complete = () => {
    if (isCompleted) return;
    setIsCompleted(true);
    setPosition(maxPositionRef.current);
    
    // Тактильная обратная связь
    if (vibrate) {
      // Telegram Web App haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      } 
      // Обычная вибрация браузера
      else if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
    }
    
    // Вызываем callback
    setTimeout(() => {
      onComplete();
    }, 200);
  };

  // Легкая вибрация при начале движения
  useEffect(() => {
    if (isDragging && position > 0 && vibrate) {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    }
  }, [isDragging]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, position]);

  const progressPercentage = (position / maxPositionRef.current) * 100 || 0;
  const textOpacity = Math.max(0, 1 - progressPercentage / 50);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={`relative h-14 bg-gradient-to-r ${
          isCompleted
            ? 'from-green-500 to-green-600'
            : 'from-blue-500 to-blue-600'
        } rounded-xl overflow-hidden transition-all duration-300 shadow-lg ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
        } ${!disabled && !isCompleted ? 'animate-pulse-slow' : ''}`}
      >
        {/* Фоновый градиент прогресса */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 transition-opacity duration-200"
          style={{ opacity: progressPercentage / 100 }}
        />

        {/* Текст */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: textOpacity }}
        >
          <span className="text-white font-semibold text-sm select-none">
            {isCompleted ? '✓ Рейс начинается...' : text}
          </span>
        </div>

        {/* Стрелки-подсказки */}
        {!isCompleted && (
          <div className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none">
            <div className="flex space-x-1 opacity-30">
              <ChevronRight className="w-5 h-5 text-white animate-pulse" style={{ animationDelay: '0ms' }} />
              <ChevronRight className="w-5 h-5 text-white animate-pulse" style={{ animationDelay: '150ms' }} />
              <ChevronRight className="w-5 h-5 text-white animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Слайдер */}
        <div
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          className={`absolute top-1 left-1 h-12 w-12 bg-white rounded-lg shadow-lg flex items-center justify-center transition-transform ${
            isDragging ? 'scale-105' : 'scale-100'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
          style={{
            transform: `translateX(${position}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {isCompleted ? (
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <ChevronRight className="w-6 h-6 text-blue-600" />
          )}
        </div>
      </div>
    </div>
  );
};

