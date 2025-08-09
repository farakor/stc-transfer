import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'

export function BookingStatus() {
  const { bookingId } = useParams()
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
          Статус заказа
        </h1>

        <p className="text-gray-600 mb-4">
          Заказ №{bookingId}
        </p>

        <p className="text-gray-600 mb-8">
          Страница отслеживания статуса заказа (в разработке)
        </p>

        <button
          onClick={() => navigate('/language')}
          className="btn-secondary w-full"
        >
          Новый заказ
        </button>
      </motion.div>
    </div>
  )
}
