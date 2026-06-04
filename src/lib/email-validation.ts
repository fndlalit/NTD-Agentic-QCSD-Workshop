// Advanced email validation beyond basic regex
// Provides detailed validation for email addresses with specific rules

export interface EmailValidationResult {
  valid: boolean
  error?: string
  normalized?: string
  domain?: string
  localPart?: string
}

/**
 * List of known disposable email domains
 */
const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  'trashmail.com',
  '10minutemail.com',
  'fakeinbox.com',
]

/**
 * Validates an email address with detailed results
 */
export const validateEmailDetailed = (email: string): EmailValidationResult => {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' }
  }

  const trimmed = email.trim().toLowerCase()

  // Check basic format
  const atIndex = trimmed.lastIndexOf('@')
  if (atIndex < 1) {
    return { valid: false, error: 'Email must contain @ symbol' }
  }

  const localPart = trimmed.substring(0, atIndex)
  const domain = trimmed.substring(atIndex + 1)

  // Validate local part
  if (localPart.length === 0) {
    return { valid: false, error: 'Email local part is empty' }
  }

  if (localPart.length > 64) {
    return { valid: false, error: 'Email local part exceeds 64 characters' }
  }

  // Check for consecutive dots in local part
  if (/\.\./.test(localPart)) {
    return { valid: false, error: 'Email cannot contain consecutive dots' }
  }

  // Check if local part starts or ends with a dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { valid: false, error: 'Email cannot start or end with a dot' }
  }

  // Validate domain
  if (domain.length === 0) {
    return { valid: false, error: 'Email domain is empty' }
  }

  if (!domain.includes('.')) {
    return { valid: false, error: 'Email domain must contain a dot' }
  }

  // Check domain parts
  const domainParts = domain.split('.')
  for (const part of domainParts) {
    if (part.length === 0) {
      return { valid: false, error: 'Email domain has empty labels' }
    }
    if (part.length > 63) {
      return { valid: false, error: 'Email domain label exceeds 63 characters' }
    }
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(part)) {
      return { valid: false, error: 'Email domain contains invalid characters' }
    }
  }

  // Check TLD length
  const tld = domainParts[domainParts.length - 1]
  if (tld.length < 2) {
    return { valid: false, error: 'Email TLD must be at least 2 characters' }
  }

  // Total email length check (RFC 5321)
  if (trimmed.length > 254) {
    return { valid: false, error: 'Email exceeds maximum length of 254 characters' }
  }

  return {
    valid: true,
    normalized: trimmed,
    domain,
    localPart,
  }
}

/**
 * Checks if an email uses a disposable/temporary email domain
 */
export const isDisposableEmail = (email: string): boolean => {
  const result = validateEmailDetailed(email)
  if (!result.valid || !result.domain) return false
  return DISPOSABLE_DOMAINS.includes(result.domain)
}

/**
 * Normalizes an email address (lowercase, trim, handle Gmail dots/plus)
 */
export const normalizeEmail = (email: string): string | null => {
  const result = validateEmailDetailed(email)
  if (!result.valid || !result.normalized) return null

  let { localPart, domain } = result

  // Gmail-specific normalization: remove dots and +suffix from local part
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    localPart = localPart!.split('+')[0].replace(/\./g, '')
    domain = 'gmail.com' // Normalize googlemail.com to gmail.com
  }

  return `${localPart}@${domain}`
}

/**
 * Suggests corrections for common email typos
 */
export const suggestEmailCorrection = (email: string): string | null => {
  const result = validateEmailDetailed(email)
  if (!result.domain) return null

  const corrections: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'hotmal.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmail.co': 'hotmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'outloo.com': 'outlook.com',
    'outlok.com': 'outlook.com',
  }

  const correctedDomain = corrections[result.domain]
  if (correctedDomain) {
    return `${result.localPart}@${correctedDomain}`
  }

  return null
}
