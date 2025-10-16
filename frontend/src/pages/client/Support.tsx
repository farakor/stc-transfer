import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import { Phone, Send, Mail, MessageCircle, FileEdit, CreditCard, Car, HelpCircle, CheckCircle, Clock, Loader2, ChevronDown } from 'lucide-react'

export function Support() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const contactMethods = [
    {
      id: 'phone',
      icon: Phone,
      title: t.support.phone,
      value: '+998 90 123 45 67',
      action: 'tel:+998901234567',
      color: 'bg-blue-500'
    },
    {
      id: 'telegram',
      icon: Send,
      title: t.support.telegram,
      value: '@stc_support',
      action: 'https://t.me/stc_support',
      color: 'bg-sky-500'
    },
    {
      id: 'email',
      icon: Mail,
      title: t.support.email,
      value: 'support@stc-transfer.uz',
      action: 'mailto:support@stc-transfer.uz',
      color: 'bg-purple-500'
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      title: t.support.whatsapp,
      value: '+998 90 123 45 67',
      action: 'https://wa.me/998901234567',
      color: 'bg-green-500'
    }
  ]

  const faqTopics = [
    {
      id: 'booking',
      title: t.faq.booking,
      icon: FileEdit,
      questions: [
        {
          q: t.faq.howToBook,
          a: t.faq.howToBookAnswer
        },
        {
          q: t.faq.canCancel,
          a: t.faq.canCancelAnswer
        },
        {
          q: t.faq.howMuchAdvance,
          a: t.faq.howMuchAdvanceAnswer
        }
      ]
    },
    {
      id: 'payment',
      title: t.faq.payment,
      icon: CreditCard,
      questions: [
        {
          q: t.faq.paymentMethods,
          a: t.faq.paymentMethodsAnswer
        },
        {
          q: t.faq.whenToPay,
          a: t.faq.whenToPayAnswer
        }
      ]
    },
    {
      id: 'vehicles',
      title: t.faq.vehicles,
      icon: Car,
      questions: [
        {
          q: t.faq.vehicleTypes,
          a: t.faq.vehicleTypesAnswer
        },
        {
          q: t.faq.changeSeat,
          a: t.faq.changeSeatAnswer
        }
      ]
    },
    {
      id: 'other',
      title: t.faq.other,
      icon: HelpCircle,
      questions: [
        {
          q: t.faq.trackVehicle,
          a: t.faq.trackVehicleAnswer
        },
        {
          q: t.faq.luggage,
          a: t.faq.luggageAnswer
        }
      ]
    }
  ]

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setSending(true)
    try {
      // Здесь можно добавить API вызов для отправки сообщения
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSent(true)
      setMessage('')
      setTimeout(() => setSent(false), 3000)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t.support.title}
          </h1>
          <p className="text-gray-600">
            {t.support.subtitle}
          </p>
        </div>

        {/* Quick Contact */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t.support.contactUs}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {contactMethods.map((method) => {
              const Icon = method.icon
              return (
                <a
                  key={method.id}
                  href={method.action}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`${method.color} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                  <p className="text-sm text-gray-600">{method.value}</p>
                </a>
              )
            })}
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t.support.sendMessage}
          </h2>
          
          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">
                {t.support.messageSent}
              </p>
              <p className="text-sm text-green-700 mt-1">
                {t.support.messageSentDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.support.phoneNumber}
                </label>
                <input
                  type="tel"
                  value={user?.phone_number || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.support.message}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.support.messagePlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || sending}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {t.support.sending}
                  </span>
                ) : (
                  t.support.send
                )}
              </button>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t.support.faq}
          </h2>
          <div className="space-y-3">
            {faqTopics.map((topic) => {
              const Icon = topic.icon
              return (
                <div key={topic.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-6 h-6 text-gray-600" />
                      <span className="font-semibold text-gray-900">{topic.title}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${selectedTopic === topic.id ? 'rotate-180' : ''}`} />
                    </button>
                  
                  {selectedTopic === topic.id && (
                    <div className="px-6 pb-4 space-y-4">
                      {topic.questions.map((qa, index) => (
                        <div key={index} className="border-t border-gray-100 pt-4">
                          <h4 className="font-medium text-gray-900 mb-2">{qa.q}</h4>
                          <p className="text-gray-600 text-sm">{qa.a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                {t.support.workingHours}
              </h4>
              <p className="text-sm text-blue-700">
                {t.support.available}
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}

