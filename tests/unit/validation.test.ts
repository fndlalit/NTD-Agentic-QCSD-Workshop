import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validateZipCode,
  validateName,
  validateAddress,
  validateGdprConsent,
  validateCheckoutForm,
  validatePaymentAmount,
  type FormData,
} from '@/src/lib/validation'

describe('Form Validation', () => {
  describe('Email validation', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBeNull()
      expect(validateEmail('test.email@domain.co.uk')).toBeNull()
      expect(validateEmail('user+tag@example.com')).toBeNull()
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).not.toBeNull()
      expect(validateEmail('user@')).not.toBeNull()
      expect(validateEmail('@example.com')).not.toBeNull()
      expect(validateEmail('user @example.com')).not.toBeNull()
      expect(validateEmail('')).not.toBeNull()
    })
  })

  describe('Zip code validation', () => {
    it('should accept valid US zip codes', () => {
      expect(validateZipCode('12345')).toBeNull()
      expect(validateZipCode('12345-6789')).toBeNull()
    })

    it('should reject invalid zip codes', () => {
      expect(validateZipCode('1234')).not.toBeNull()
      expect(validateZipCode('123456')).not.toBeNull()
      expect(validateZipCode('abcde')).not.toBeNull()
      expect(validateZipCode('')).not.toBeNull()
    })
  })

  describe('Name validation', () => {
    it('should accept valid names', () => {
      expect(validateName('John Doe')).toBeNull()
      expect(validateName('AB')).toBeNull()
      expect(validateName('Mary Jane Watson')).toBeNull()
    })

    it('should reject invalid names', () => {
      expect(validateName('')).not.toBeNull()
      expect(validateName('   ')).not.toBeNull()
      expect(validateName('A')).not.toBeNull()
    })
  })

  describe('Address validation', () => {
    it('should accept valid addresses', () => {
      expect(validateAddress('123 Main Street')).toBeNull()
      expect(validateAddress('1600 Pennsylvania Avenue')).toBeNull()
    })

    it('should reject invalid addresses', () => {
      expect(validateAddress('')).not.toBeNull()
      expect(validateAddress('   ')).not.toBeNull()
      expect(validateAddress('123')).not.toBeNull()
      expect(validateAddress('St')).not.toBeNull()
    })
  })

  describe('GDPR consent validation', () => {
    it('should accept consent when true', () => {
      expect(validateGdprConsent(true)).toBeNull()
    })

    it('should reject consent when false', () => {
      expect(validateGdprConsent(false)).not.toBeNull()
    })
  })

  describe('Payment amount validation', () => {
    it('should accept positive amounts', () => {
      expect(validatePaymentAmount(100)).toBeNull()
      expect(validatePaymentAmount(0.01)).toBeNull()
    })

    it('should reject zero or negative amounts', () => {
      expect(validatePaymentAmount(0)).not.toBeNull()
      expect(validatePaymentAmount(-10)).not.toBeNull()
    })
  })

  describe('Full checkout form validation', () => {
    it('should validate a complete valid form', () => {
      const validForm: FormData = {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main Street',
        zipCode: '12345',
        gdprConsent: true,
      }
      const errors = validateCheckoutForm(validForm)
      expect(Object.keys(errors).length).toBe(0)
    })

    it('should catch multiple validation errors', () => {
      const invalidForm: FormData = {
        name: '',
        email: 'invalid',
        address: 'St',
        zipCode: 'ABCDE',
        gdprConsent: false,
      }
      const errors = validateCheckoutForm(invalidForm)
      expect(Object.keys(errors).length).toBeGreaterThan(3)
      expect(errors.name).toBeDefined()
      expect(errors.email).toBeDefined()
      expect(errors.address).toBeDefined()
      expect(errors.zipCode).toBeDefined()
      expect(errors.gdprConsent).toBeDefined()
    })
  })
})
