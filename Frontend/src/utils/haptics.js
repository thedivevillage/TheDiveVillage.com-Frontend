/**
 * Web Vibration API helper for mobile tactile/haptic feedback
 */
export function triggerHaptic(duration = 10) {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      navigator.vibrate(duration)
    }
  } catch {
    // Ignore unsupported devices / permissions
  }
}

export function triggerSuccessHaptic() {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      navigator.vibrate([15, 40, 15])
    }
  } catch {
    // Ignore unsupported devices / permissions
  }
}

export function triggerMediumHaptic() {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      navigator.vibrate(20)
    }
  } catch {
    // Ignore unsupported devices / permissions
  }
}

export function triggerErrorHaptic() {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      navigator.vibrate([30, 50, 30])
    }
  } catch {
    // Ignore unsupported devices / permissions
  }
}
