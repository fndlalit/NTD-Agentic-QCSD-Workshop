// Form validation logic extracted for testability
// This module contains all validation rules for the checkout form

export interface FormData {
  name: string
  email: string
  address: string
  zipCode: string
  gdprConsent: boolean
}

export interface FormErrors {
  [key: string]: string
}

/**
 * Validates a name field
 * Rules: Required, non-empty, at least 2 characters
 */
export const validateName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Name is required'
  }
  if (name.length < 2) {
    return 'Name must be at least 2 characters'
  }
  return null
}

/**
 * Validates an email field
 * Rules: Required, valid email format
 */
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}

/**
 * Validates an address field
 * Rules: Required, non-empty, at least 5 characters
 */
export const validateAddress = (address: string): string | null => {
  if (!address || address.trim().length === 0) {
    return 'Address is required'
  }
  if (address.length < 5) {
    return 'Please enter a complete address'
  }
  return null
}

/**
 * Validates a zip code field
 * Rules: Required, valid US zip code format (12345 or 12345-6789)
 */
export const validateZipCode = (zipCode: string): string | null => {
  if (!zipCode || zipCode.trim().length === 0) {
    return 'Zip code is required'
  }
  if (!/^\d{5}(?:-\d{4})?$/.test(zipCode.replace(/\s/g, ''))) {
    return 'Please enter a valid zip code'
  }
  return null
}

/**
 * Validates GDPR consent
 * Rules: Must be checked (true)
 */
export const validateGdprConsent = (gdprConsent: boolean): string | null => {
  if (!gdprConsent) {
    return 'You must consent to the GDPR policy to continue'
  }
  return null
}

/**
 * Validates the entire form
 * Returns an object with field-level error messages
 * Empty object means form is valid
 */
export const validateCheckoutForm = (formData: FormData): FormErrors => {
  const newErrors: FormErrors = {}

  const nameError = validateName(formData.name)
  if (nameError) {
    newErrors.name = nameError
  }

  const emailError = validateEmail(formData.email)
  if (emailError) {
    newErrors.email = emailError
  }

  const addressError = validateAddress(formData.address)
  if (addressError) {
    newErrors.address = addressError
  }

  const zipCodeError = validateZipCode(formData.zipCode)
  if (zipCodeError) {
    newErrors.zipCode = zipCodeError
  }

  const gdprError = validateGdprConsent(formData.gdprConsent)
  if (gdprError) {
    newErrors.gdprConsent = gdprError
  }

  return newErrors
}

/**
 * Validates payment request input
 * Rules: Amount must be positive
 */
export const validatePaymentAmount = (amount: number): string | null => {
  if (!amount || amount <= 0) {
    return 'Invalid payment amount'
  }
  return null
}
