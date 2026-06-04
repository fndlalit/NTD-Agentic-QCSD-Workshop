// Luhn algorithm for credit card number validation
// Used to validate card numbers before sending to payment gateway

/**
 * Validates a credit card number using the Luhn algorithm
 * @param cardNumber - The card number as a string (may contain spaces/dashes)
 * @returns true if the card number passes the Luhn check
 */
export const luhnCheck = (cardNumber: string): boolean => {
  // Strip spaces and dashes
  const sanitized = cardNumber.replace(/[\s-]/g, '')

  // Must be all digits
  if (!/^\d+$/.test(sanitized)) {
    return false
  }

  // Must be between 13 and 19 digits
  if (sanitized.length < 13 || sanitized.length > 19) {
    return false
  }

  let sum = 0
  let isEven = false

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Identifies the card brand from the card number
 * @param cardNumber - The card number as a string
 * @returns The card brand or 'unknown'
 */
export const getCardBrand = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/[\s-]/g, '')

  if (/^4/.test(sanitized)) return 'visa'
  if (/^5[1-5]/.test(sanitized)) return 'mastercard'
  if (/^3[47]/.test(sanitized)) return 'amex'
  if (/^6(?:011|5)/.test(sanitized)) return 'discover'
  if (/^35(?:2[89]|[3-8])/.test(sanitized)) return 'jcb'

  return 'unknown'
}

/**
 * Masks a card number showing only the last 4 digits
 * @param cardNumber - The full card number
 * @returns Masked card number like **** **** **** 1234
 */
export const maskCardNumber = (cardNumber: string): string => {
  const sanitized = cardNumber.replace(/[\s-]/g, '')
  if (sanitized.length < 4) return sanitized
  const last4 = sanitized.slice(-4)
  const masked = sanitized.slice(0, -4).replace(/\d/g, '*')
  // Format in groups of 4
  const full = masked + last4
  return full.match(/.{1,4}/g)?.join(' ') ?? full
}

/**
 * Validates the card expiry date
 * @param month - Expiry month (1-12)
 * @param year - Expiry year (4-digit or 2-digit)
 * @returns null if valid, error message if invalid
 */
export const validateExpiry = (month: number, year: number): string | null => {
  if (month < 1 || month > 12) {
    return 'Invalid expiry month'
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Handle 2-digit year
  const fullYear = year < 100 ? 2000 + year : year

  if (fullYear < currentYear) {
    return 'Card has expired'
  }

  if (fullYear === currentYear && month < currentMonth) {
    return 'Card has expired'
  }

  // Reject dates too far in the future (more than 20 years)
  if (fullYear > currentYear + 20) {
    return 'Invalid expiry year'
  }

  return null
}

/**
 * Validates a CVV
 * @param cvv - The CVV string
 * @param brand - The card brand (amex requires 4 digits, others 3)
 * @returns null if valid, error message if invalid
 */
export const validateCVV = (cvv: string, brand: string = 'visa'): string | null => {
  if (!/^\d+$/.test(cvv)) {
    return 'CVV must contain only digits'
  }

  const expectedLength = brand === 'amex' ? 4 : 3

  if (cvv.length !== expectedLength) {
    return `CVV must be ${expectedLength} digits for ${brand}`
  }

  return null
}
