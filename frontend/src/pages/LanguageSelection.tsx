import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Language, LanguageOption } from '@/types'
import { useAppStore } from '@/services/store'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'

const languages: LanguageOption[] = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'uz', name: 'O\'zbek', flag: '🇺🇿' }
]

export function LanguageSelection() {
  const navigate = useNavigate()
  const { setLanguage, setCurrentStep } = useAppStore()
  const { webApp, user } = useTelegramWebApp()

  const handleLanguageSelect = (language: Language) => {
    // Save language to store
    setLanguage(language)
    setCurrentStep(0)

    // Save to localStorage for persistence
    localStorage.setItem('language', language)

    // Provide haptic feedback if available
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged()
    }

    console.log('Selected language:', language)
    navigate('/vehicles')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 px-4 py-8">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo and title */}
        <div className="text-center mb-12">
          <motion.div
            className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </motion.div>

          <motion.h1
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            STC Transfer
          </motion.h1>

          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Выберите язык / Choose language / Tilni tanlang
          </motion.p>
        </div>

        {/* Language options */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {languages.map((language, index) => (
            <motion.button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className="w-full p-4 bg-white rounded-xl shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{language.flag}</span>
                <span className="text-lg font-medium text-gray-900">
                  {language.name}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-gray-500">
            Samarkand Touristic Centre
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
