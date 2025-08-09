import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export function BookingConfirmation() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Подтверждение заказа
        </h1>

        <p className="text-gray-600 mb-8">
          Страница подтверждения заказа (в разработке)
        </p>

        <button
          onClick={() => navigate('/status/123')}
          className="btn-primary w-full"
        >
          Посмотреть статус
        </button>
      </motion.div>
    </div>
  )
}
