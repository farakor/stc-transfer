import { useAppStore } from '@/services/store'
import { locales, Locale } from '@/locales'
import { Translations } from '@/locales/ru'

export function useTranslation() {
  const language = useAppStore((state) => state.language) as Locale
  
  // Получаем переводы для текущего языка
  const t = locales[language] || locales.ru
  
  return { t, language }
}

// Хелпер для получения вложенных значений по пути
export function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

