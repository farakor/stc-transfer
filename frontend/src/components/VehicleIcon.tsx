import { VehicleType } from '@/types'
import { getVehicleDisplayElement } from '@/utils/formatting'

interface VehicleIconProps {
  type: VehicleType
  brand?: string
  model?: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: {
    container: 'w-7 h-7 text-sm',
    image: 'w-7 h-5'
  },
  md: {
    container: 'w-10 h-10 text-lg',
    image: 'w-10 h-7'
  },
  lg: {
    container: 'w-14 h-14 text-xl',
    image: 'w-14 h-10'
  },
  xl: {
    container: 'w-28 h-28 text-2xl',
    image: 'w-28 h-22'
  }
}

export function VehicleIcon({
  type,
  brand,
  model,
  imageUrl,
  size = 'md',
  className = ''
}: VehicleIconProps) {
  const displayElement = getVehicleDisplayElement(type, brand, model, imageUrl)
  const sizeClass = sizeClasses[size]

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClass.container} ${className}`}
      title={brand && model ? `${brand} ${model}` : undefined}
    >
      {displayElement.type === 'image' ? (
        <img
          src={displayElement.content}
          alt={brand && model ? `${brand} ${model}` : 'Автомобиль'}
          className={`${sizeClass.image} object-contain`}
        />
      ) : (
        displayElement.content
      )}
    </span>
  )
}
