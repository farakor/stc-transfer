import { motion } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'
import Logo from '@/assets/STC-transfer.svg'
import FarukBadge from '@/assets/faruk-badge.svg'

export function LoadingScreen() {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="mx-auto mb-6 flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <img src={Logo} alt="STC Transfer" className="w-32 h-32" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl font-bold text-gray-900 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          STC Transfer
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-gray-600 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Samarkand Touristic Centre
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          className="flex justify-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>

        {/* Loading text */}
        <motion.p
          className="text-sm text-gray-500 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {t.common.loading}
        </motion.p>

        {/* Footer */}
        <motion.div
          className="text-center mt-8 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-2">{t.footer.developedBy}</p>
            <img src={FarukBadge} alt="Faruk" className="h-6 w-auto" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
