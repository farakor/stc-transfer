import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Calendar, Clock, X } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface CustomDateTimePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  hint?: string
  className?: string
  min?: string
}

export function CustomDateTimePicker({
  value,
  onChange,
  label,
  placeholder,
  hint,
  className = '',
  min
}: CustomDateTimePickerProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  
  const defaultPlaceholder = placeholder || t.datePicker?.selectDateTime || 'Выберите дату и время'

  // Инициализация из value
  useEffect(() => {
    if (value) {
      const [date, time] = value.split('T')
      setSelectedDate(date)
      setSelectedTime(time || '12:00')
    }
  }, [value])

  // Закрыть при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Форматирование отображаемой даты
  const formatDisplayDate = (dateStr: string, timeStr: string) => {
    if (!dateStr) return defaultPlaceholder

    try {
      const date = new Date(dateStr + 'T' + (timeStr || '00:00'))
      
      const months = t.datePicker?.months || [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ]
      
      const day = date.getDate()
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      return `${day} ${month} ${year}, ${hours}:${minutes}`
    } catch {
      return defaultPlaceholder
    }
  }

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    if (selectedTime) {
      const datetime = `${newDate}T${selectedTime}`
      onChange(datetime)
    }
  }

  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime)
    if (selectedDate) {
      const datetime = `${selectedDate}T${newTime}`
      onChange(datetime)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDate('')
    setSelectedTime('')
    onChange('')
  }

  const handleApply = () => {
    if (selectedDate && selectedTime) {
      const datetime = `${selectedDate}T${selectedTime}`
      onChange(datetime)
      setIsOpen(false)
    }
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Кнопка открытия */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 text-left bg-white border-2 rounded-xl
          flex items-center justify-between
          transition-all duration-200
          ${isOpen 
            ? 'border-primary-500 ring-4 ring-primary-100' 
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className={`${value ? 'text-gray-900' : 'text-gray-400'}`}>
            {formatDisplayDate(selectedDate, selectedTime)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {value && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </motion.button>
          )}
        </div>
      </motion.button>

      {hint && (
        <p className="text-xs text-gray-500 mt-1">
          {hint}
        </p>
      )}

      {/* Всплывающая панель */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Быстрая кнопка - В ближайшее время */}
            <div className="p-4 pb-0">
              <motion.button
                type="button"
                onClick={() => {
                  const now = new Date()
                  const dateStr = now.toISOString().split('T')[0]
                  const timeStr = now.toTimeString().slice(0, 5)
                  setSelectedDate(dateStr)
                  setSelectedTime(timeStr)
                  const datetime = `${dateStr}T${timeStr}`
                  onChange(datetime)
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Clock className="w-4 h-4" />
                <span>{t.datePicker?.asap || 'В ближайшее время'}</span>
              </motion.button>
            </div>

            {/* Контейнер с полями выбора */}
            <div className="pt-4 pb-4 pl-4 pr-11">
              {/* Выбор даты */}
              <div className="mb-4">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{t.datePicker?.date || 'Дата'}</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={min?.split('T')[0]}
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              {/* Выбор времени */}
              <div className="mb-4">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{t.datePicker?.time || 'Время'}</span>
                </label>
                
                {/* Выбор времени */}
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>

            {/* Контейнер с кнопками действий */}
            <div className="px-4 pb-4">
              <div className="flex space-x-2">
                <motion.button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t.common.cancel}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleApply}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={selectedDate && selectedTime ? { scale: 1.02 } : {}}
                  whileTap={selectedDate && selectedTime ? { scale: 0.98 } : {}}
                >
                  {t.datePicker?.apply || t.common.confirm}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

