import { motion } from 'framer-motion'
import clsx from 'clsx'

interface ProgressBarProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function ProgressBar({ steps, currentStep, className }: ProgressBarProps) {
  return (
    <div className={clsx('w-full', className)}>
      {/* Progress Line */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <motion.div
              className="bg-primary-500 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Step Circles */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white text-sm font-medium',
                index <= currentStep
                  ? 'border-primary-500 text-primary-600'
                  : 'border-gray-300 text-gray-400'
              )}
              initial={{ scale: 0.8 }}
              animate={{
                scale: index === currentStep ? 1.1 : 1,
                borderColor: index <= currentStep ? '#3b82f6' : '#d1d5db'
              }}
              transition={{ duration: 0.3 }}
            >
              {index < currentStep ? (
                <motion.svg
                  className="w-4 h-4 text-primary-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              ) : (
                index + 1
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Step Labels */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={clsx(
              'text-xs text-center flex-1',
              index <= currentStep ? 'text-primary-600 font-medium' : 'text-gray-500'
            )}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}
