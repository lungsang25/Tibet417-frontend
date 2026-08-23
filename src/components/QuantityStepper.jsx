import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Replaces bare `<input type='number'>` quantity fields (Cart, PDP) with a
 * proper +/- stepper. Clamps to [min, max] and never emits an empty/invalid
 * value to onChange.
 */
const QuantityStepper = ({ value, min = 1, max, onChange, label }) => {
  const { t } = useTranslation('common')

  const clamp = (next) => {
    let clamped = next
    if (clamped < min) clamped = min
    if (typeof max === 'number' && clamped > max) clamped = max
    return clamped
  }

  const handleInputChange = (event) => {
    const parsed = parseInt(event.target.value, 10)
    if (Number.isNaN(parsed)) return
    onChange(clamp(parsed))
  }

  return (
    <div className='inline-flex items-center border border-line'>
      <button
        type='button'
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label={t('quantityStepper.decrease')}
        className='px-3 py-1 text-lg leading-none disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer'
      >
        −
      </button>
      <input
        type='number'
        inputMode='numeric'
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        aria-label={label || t('quantityStepper.label')}
        className='w-10 text-center outline-none border-x border-line py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
      />
      <button
        type='button'
        onClick={() => onChange(clamp(value + 1))}
        disabled={typeof max === 'number' && value >= max}
        aria-label={t('quantityStepper.increase')}
        className='px-3 py-1 text-lg leading-none disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer'
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper
