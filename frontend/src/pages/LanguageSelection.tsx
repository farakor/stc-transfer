import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Language, LanguageOption } from '@/types'
import { useAppStore } from '@/services/store'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import Logo from '@/assets/STC-transfer.svg'
import FarukBadge from '@/assets/faruk-badge.svg'

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
            className="mx-auto mb-6 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <img src={Logo} alt="STC Transfer" className="w-32 h-32" />
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
          className="text-center mt-12 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-gray-500">
            Samarkand Touristic Centre
          </p>
          
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-2">Developed by</p>
            <img src={FarukBadge} alt="Faruk" className="h-6 w-auto" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
