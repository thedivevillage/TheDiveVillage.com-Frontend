export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())

export const isPhone = (value) =>
  /^[6-9]\d{9}$/.test(String(value || '').replace(/\D/g, ''))

export const required = (value) =>
  String(value ?? '').trim().length > 0

export const minLength = (value, min) =>
  String(value ?? '').trim().length >= min

export function validateCheckout(form) {
  const errors = {}
  if (!required(form.fullName)) errors.fullName = 'Full name is required'
  if (!isEmail(form.email)) errors.email = 'Enter a valid email'
  if (!isPhone(form.phone)) errors.phone = 'Enter a valid 10-digit mobile'
  if (!required(form.address)) errors.address = 'Address is required'
  if (!required(form.city)) errors.city = 'City is required'
  if (!required(form.pincode) || String(form.pincode).length < 6) {
    errors.pincode = 'Enter a valid pincode'
  }
  return errors
}
