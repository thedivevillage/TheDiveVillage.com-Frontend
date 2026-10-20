import { useState, useEffect } from 'react'
import { triggerHaptic } from '../utils/haptics'

export default function QuantitySelector({
  value = 0,
  onChange,
  min = 0,
  max = 99,
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  id,
}) {
  const [typedValue, setTypedValue] = useState(String(value ?? min))

  useEffect(() => {
    setTypedValue(String(value ?? min))
  }, [value, min])

  const handleInputChange = (e) => {
    const raw = e.target.value
    if (raw === '') {
      setTypedValue('')
      return
    }
    const clean = raw.replace(/\D/g, '')
    setTypedValue(clean)
    if (clean !== '') {
      const num = parseInt(clean, 10)
      if (!isNaN(num)) {
        const clamped = Math.min(Math.max(num, min), max)
        onChange?.(clamped)
      }
    }
  }

  const handleBlur = () => {
    const num = parseInt(typedValue, 10)
    if (isNaN(num) || num < min) {
      setTypedValue(String(min))
      onChange?.(min)
    } else if (num > max) {
      setTypedValue(String(max))
      onChange?.(max)
    } else {
      setTypedValue(String(num))
      onChange?.(num)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleIncrement(e)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleDecrement(e)
    } else if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  const handleDecrement = (e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    if (disabled || (value ?? 0) <= min) return
    triggerHaptic(6)
    const next = Math.max(min, (value ?? 0) - 1)
    setTypedValue(String(next))
    onChange?.(next)
  }

  const handleIncrement = (e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    if (disabled || (value ?? 0) >= max) return
    triggerHaptic(6)
    const next = Math.min(max, (value ?? 0) + 1)
    setTypedValue(String(next))
    onChange?.(next)
  }

  const isMinusDisabled = disabled || (value ?? 0) <= min
  const isPlusDisabled = disabled || (value ?? 0) >= max

  const sizeClasses = {
    sm: {
      wrap: 'h-8 text-xs',
      btn: 'w-7 h-7 text-xs',
      input: 'w-9 text-xs font-bold',
    },
    md: {
      wrap: 'h-10 text-sm',
      btn: 'w-9 h-9 text-sm',
      input: 'w-12 text-sm font-bold',
    },
    lg: {
      wrap: 'h-11 sm:h-12 text-base',
      btn: 'w-10 h-10 text-base',
      input: 'w-14 text-base font-bold',
    },
  }[size] || {
    wrap: 'h-10 text-sm',
    btn: 'w-9 h-9 text-sm',
    input: 'w-12 text-sm font-bold',
  }

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-gray-300 bg-white shadow-2xs p-0.5 transition-colors focus-within:border-gray-700 ${sizeClasses.wrap} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Minus Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isMinusDisabled}
        aria-label="Decrease quantity"
        title={isMinusDisabled ? `Minimum is ${min}` : 'Decrease quantity'}
        className={`flex items-center justify-center rounded-md text-gray-700 transition active:scale-95 cursor-pointer hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent ${sizeClasses.btn}`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Number Box / Input */}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={typedValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Quantity"
        className={`h-full text-center bg-transparent text-gray-900 focus:outline-none select-all ${sizeClasses.input}`}
      />

      {/* Plus Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isPlusDisabled}
        aria-label="Increase quantity"
        title={isPlusDisabled ? `Maximum is ${max}` : 'Increase quantity'}
        className={`flex items-center justify-center rounded-md text-gray-700 transition active:scale-95 cursor-pointer hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent ${sizeClasses.btn}`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}
