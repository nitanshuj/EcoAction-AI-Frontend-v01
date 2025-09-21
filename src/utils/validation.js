/**
 * Frontend validation utilities
 */

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

export const validators = {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {Object} - {isValid: boolean, error: string}
   */
  email(email) {
    if (!email || !email.trim()) {
      return { isValid: false, error: 'Email is required' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, error: 'Please enter a valid email address' }
    }

    return { isValid: true, error: '' }
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - {isValid: boolean, error: string, strength: string}
   */
  password(password) {
    if (!password) {
      return { isValid: false, error: 'Password is required', strength: 'none' }
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long', strength: 'weak' }
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Password must be less than 128 characters', strength: 'weak' }
    }

    let strength = 'weak'
    let score = 0

    // Check for lowercase
    if (/[a-z]/.test(password)) score++
    // Check for uppercase
    if (/[A-Z]/.test(password)) score++
    // Check for numbers
    if (/\d/.test(password)) score++
    // Check for special characters
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++
    // Length bonus
    if (password.length >= 12) score++

    if (score < 3) {
      strength = 'weak'
    } else if (score < 4) {
      strength = 'medium'
    } else {
      strength = 'strong'
    }

    if (score < 4) {
      return {
        isValid: false,
        error: 'Password must contain uppercase, lowercase, numbers, and special characters',
        strength
      }
    }

    return { isValid: true, error: '', strength }
  },

  /**
   * Validate name fields
   * @param {string} name - Name to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {Object} - {isValid: boolean, error: string}
   */
  name(name, fieldName = 'Name') {
    if (!name || !name.trim()) {
      return { isValid: false, error: `${fieldName} is required` }
    }

    const trimmedName = name.trim()

    if (trimmedName.length < 2) {
      return { isValid: false, error: `${fieldName} must be at least 2 characters long` }
    }

    if (trimmedName.length > 50) {
      return { isValid: false, error: `${fieldName} must be less than 50 characters long` }
    }

    // Allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
      return {
        isValid: false,
        error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
      }
    }

    return { isValid: true, error: '' }
  },

  /**
   * Validate age
   * @param {number|string} age - Age to validate
   * @returns {Object} - {isValid: boolean, error: string}
   */
  age(age) {
    if (age === null || age === undefined || age === '') {
      return { isValid: false, error: 'Age is required' }
    }

    const numAge = parseInt(age, 10)

    if (isNaN(numAge)) {
      return { isValid: false, error: 'Age must be a valid number' }
    }

    if (numAge < 13) {
      return { isValid: false, error: 'You must be at least 13 years old to use this service' }
    }

    if (numAge > 120) {
      return { isValid: false, error: 'Please enter a valid age' }
    }

    return { isValid: true, error: '' }
  },

  /**
   * Validate confirm password
   * @param {string} password - Original password
   * @param {string} confirmPassword - Password confirmation
   * @returns {Object} - {isValid: boolean, error: string}
   */
  confirmPassword(password, confirmPassword) {
    if (!confirmPassword) {
      return { isValid: false, error: 'Please confirm your password' }
    }

    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match' }
    }

    return { isValid: true, error: '' }
  }
}

export const sanitizers = {
  /**
   * Sanitize string input
   * @param {string} value - String to sanitize
   * @param {number} maxLength - Maximum allowed length
   * @returns {string} - Sanitized string
   */
  string(value, maxLength = null) {
    if (!value) return ''

    // Remove null bytes and trim
    let sanitized = value.replace(/\x00/g, '').trim()

    // Limit length if specified
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength)
    }

    return sanitized
  },

  /**
   * Sanitize email input
   * @param {string} email - Email to sanitize
   * @returns {string} - Sanitized email
   */
  email(email) {
    if (!email) return ''
    return email.trim().toLowerCase()
  },

  /**
   * Sanitize name input
   * @param {string} name - Name to sanitize
   * @returns {string} - Sanitized name
   */
  name(name) {
    if (!name) return ''

    // Normalize whitespace and capitalize
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
}

/**
 * Validate entire form
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - {isValid: boolean, errors: Object}
 */
export function validateForm(formData, rules) {
  const errors = {}
  let isValid = true

  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field]
    let result

    if (typeof rule === 'function') {
      result = rule(value)
    } else if (typeof rule === 'string' && validators[rule]) {
      result = validators[rule](value)
    } else if (Array.isArray(rule)) {
      // Multiple validation rules
      for (const r of rule) {
        if (typeof r === 'function') {
          result = r(value)
        } else if (validators[r]) {
          result = validators[r](value)
        }
        if (!result.isValid) break
      }
    }

    if (result && !result.isValid) {
      errors[field] = result.error
      isValid = false
    }
  }

  return { isValid, errors }
}