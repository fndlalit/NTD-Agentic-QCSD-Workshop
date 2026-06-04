import { describe, it, expect } from 'vitest'
import {
  validateEmailDetailed,
  isDisposableEmail,
  normalizeEmail,
  suggestEmailCorrection,
} from '@/src/lib/email-validation'

describe('email-validation.ts — advanced email validation', () => {
  // ─── validateEmailDetailed ─────────────────────────────────────

  describe('validateEmailDetailed', () => {
    it('accepts a standard valid email', () => {
      const result = validateEmailDetailed('user@example.com')
      expect(result.valid).toBe(true)
      expect(result.normalized).toBe('user@example.com')
      expect(result.domain).toBe('example.com')
      expect(result.localPart).toBe('user')
    })

    it('normalizes to lowercase', () => {
      const result = validateEmailDetailed('User@Example.COM')
      expect(result.valid).toBe(true)
      expect(result.normalized).toBe('user@example.com')
    })

    it('trims whitespace', () => {
      const result = validateEmailDetailed('  user@example.com  ')
      expect(result.valid).toBe(true)
      expect(result.normalized).toBe('user@example.com')
    })

    it('accepts email with subdomains', () => {
      const result = validateEmailDetailed('user@mail.sub.example.com')
      expect(result.valid).toBe(true)
      expect(result.domain).toBe('mail.sub.example.com')
    })

    it('accepts email with dots in local part', () => {
      const result = validateEmailDetailed('first.last@example.com')
      expect(result.valid).toBe(true)
    })

    it('accepts email with + tag', () => {
      const result = validateEmailDetailed('user+tag@example.com')
      expect(result.valid).toBe(true)
    })

    it('rejects empty string', () => {
      const result = validateEmailDetailed('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email is required')
    })

    it('rejects whitespace-only string', () => {
      const result = validateEmailDetailed('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email is required')
    })

    it('rejects email without @ symbol', () => {
      const result = validateEmailDetailed('userexample.com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email must contain @ symbol')
    })

    it('rejects email with empty local part', () => {
      const result = validateEmailDetailed('@example.com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email must contain @ symbol')
    })

    it('rejects local part exceeding 64 characters', () => {
      const longLocal = 'a'.repeat(65)
      const result = validateEmailDetailed(`${longLocal}@example.com`)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email local part exceeds 64 characters')
    })

    it('accepts local part of exactly 64 characters', () => {
      const local = 'a'.repeat(64)
      const result = validateEmailDetailed(`${local}@example.com`)
      expect(result.valid).toBe(true)
    })

    it('rejects consecutive dots in local part', () => {
      const result = validateEmailDetailed('user..name@example.com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email cannot contain consecutive dots')
    })

    it('rejects local part starting with a dot', () => {
      const result = validateEmailDetailed('.user@example.com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email cannot start or end with a dot')
    })

    it('rejects local part ending with a dot', () => {
      const result = validateEmailDetailed('user.@example.com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email cannot start or end with a dot')
    })

    it('rejects domain without a dot', () => {
      const result = validateEmailDetailed('user@localhost')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email domain must contain a dot')
    })

    it('rejects domain with empty labels (consecutive dots)', () => {
      const result = validateEmailDetailed('user@example..com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email domain has empty labels')
    })

    it('rejects domain label exceeding 63 characters', () => {
      const longLabel = 'a'.repeat(64)
      const result = validateEmailDetailed(`user@${longLabel}.com`)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email domain label exceeds 63 characters')
    })

    it('rejects domain with invalid characters', () => {
      const result = validateEmailDetailed('user@exam_ple.com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email domain contains invalid characters')
    })

    it('accepts domain with hyphens', () => {
      const result = validateEmailDetailed('user@my-domain.com')
      expect(result.valid).toBe(true)
    })

    it('rejects domain label starting with hyphen', () => {
      const result = validateEmailDetailed('user@-example.com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email domain contains invalid characters')
    })

    it('rejects domain label ending with hyphen', () => {
      const result = validateEmailDetailed('user@example-.com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email domain contains invalid characters')
    })

    it('rejects single-char TLD', () => {
      const result = validateEmailDetailed('user@example.c')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Email TLD must be at least 2 characters')
    })

    it('accepts 2-char TLD', () => {
      const result = validateEmailDetailed('user@example.co')
      expect(result.valid).toBe(true)
    })

    it('rejects email exceeding 254 total characters', () => {
      // Build an email that's 255+ characters
      const local = 'a'.repeat(64)
      const domain = 'b'.repeat(63) + '.' + 'c'.repeat(63) + '.' + 'd'.repeat(60) + '.com'
      const email = `${local}@${domain}`
      if (email.length > 254) {
        const result = validateEmailDetailed(email)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Email exceeds maximum length of 254 characters')
      }
    })
  })

  // ─── isDisposableEmail ─────────────────────────────────────────

  describe('isDisposableEmail', () => {
    it('detects mailinator.com as disposable', () => {
      expect(isDisposableEmail('test@mailinator.com')).toBe(true)
    })

    it('detects guerrillamail.com as disposable', () => {
      expect(isDisposableEmail('test@guerrillamail.com')).toBe(true)
    })

    it('detects yopmail.com as disposable', () => {
      expect(isDisposableEmail('test@yopmail.com')).toBe(true)
    })

    it('detects tempmail.com as disposable', () => {
      expect(isDisposableEmail('test@tempmail.com')).toBe(true)
    })

    it('does not flag gmail.com as disposable', () => {
      expect(isDisposableEmail('user@gmail.com')).toBe(false)
    })

    it('does not flag outlook.com as disposable', () => {
      expect(isDisposableEmail('user@outlook.com')).toBe(false)
    })

    it('returns false for invalid emails', () => {
      expect(isDisposableEmail('not-an-email')).toBe(false)
    })

    it('is case-insensitive', () => {
      expect(isDisposableEmail('Test@MAILINATOR.COM')).toBe(true)
    })
  })

  // ─── normalizeEmail ────────────────────────────────────────────

  describe('normalizeEmail', () => {
    it('lowercases the email', () => {
      expect(normalizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com')
    })

    it('removes dots from Gmail local part', () => {
      expect(normalizeEmail('first.last@gmail.com')).toBe('firstlast@gmail.com')
    })

    it('removes +suffix from Gmail local part', () => {
      expect(normalizeEmail('user+tag@gmail.com')).toBe('user@gmail.com')
    })

    it('normalizes googlemail.com to gmail.com', () => {
      expect(normalizeEmail('user@googlemail.com')).toBe('user@gmail.com')
    })

    it('handles Gmail with both dots and plus', () => {
      expect(normalizeEmail('first.last+tag@gmail.com')).toBe('firstlast@gmail.com')
    })

    it('does NOT remove dots from non-Gmail domains', () => {
      expect(normalizeEmail('first.last@outlook.com')).toBe('first.last@outlook.com')
    })

    it('does NOT remove +suffix from non-Gmail domains', () => {
      expect(normalizeEmail('user+tag@yahoo.com')).toBe('user+tag@yahoo.com')
    })

    it('returns null for invalid emails', () => {
      expect(normalizeEmail('')).toBeNull()
      expect(normalizeEmail('invalid')).toBeNull()
    })
  })

  // ─── suggestEmailCorrection ────────────────────────────────────

  describe('suggestEmailCorrection', () => {
    it('suggests gmail.com for gmial.com', () => {
      expect(suggestEmailCorrection('user@gmial.com')).toBe('user@gmail.com')
    })

    it('suggests gmail.com for gmal.com', () => {
      expect(suggestEmailCorrection('user@gmal.com')).toBe('user@gmail.com')
    })

    it('suggests gmail.com for gamil.com', () => {
      expect(suggestEmailCorrection('user@gamil.com')).toBe('user@gmail.com')
    })

    it('suggests gmail.com for gnail.com', () => {
      expect(suggestEmailCorrection('user@gnail.com')).toBe('user@gmail.com')
    })

    it('suggests gmail.com for gmail.co', () => {
      expect(suggestEmailCorrection('user@gmail.co')).toBe('user@gmail.com')
    })

    it('suggests hotmail.com for hotmal.com', () => {
      expect(suggestEmailCorrection('user@hotmal.com')).toBe('user@hotmail.com')
    })

    it('suggests hotmail.com for hotmial.com', () => {
      expect(suggestEmailCorrection('user@hotmial.com')).toBe('user@hotmail.com')
    })

    it('suggests yahoo.com for yahooo.com', () => {
      expect(suggestEmailCorrection('user@yahooo.com')).toBe('user@yahoo.com')
    })

    it('suggests outlook.com for outlok.com', () => {
      expect(suggestEmailCorrection('user@outlok.com')).toBe('user@outlook.com')
    })

    it('returns null for correct domains', () => {
      expect(suggestEmailCorrection('user@gmail.com')).toBeNull()
      expect(suggestEmailCorrection('user@outlook.com')).toBeNull()
    })

    it('returns null for unknown domains', () => {
      expect(suggestEmailCorrection('user@mycompany.com')).toBeNull()
    })

    it('returns null for invalid emails without domain', () => {
      expect(suggestEmailCorrection('notanemail')).toBeNull()
    })
  })
})
