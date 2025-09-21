/**
 * Tests for validation utilities
 */
import { describe, it, expect } from 'vitest'
import { validators, sanitizers, validateForm } from '@/utils/validation'

describe('validators', () => {
  describe('email', () => {
    it('should validate correct email addresses', () => {
      const result = validators.email('test@example.com')
      expect(result.isValid).toBe(true)
      expect(result.error).toBe('')
    })

    it('should reject invalid email addresses', () => {
      const result = validators.email('invalid-email')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('valid email')
    })

    it('should reject empty email', () => {
      const result = validators.email('')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('required')
    })
  })

  describe('password', () => {
    it('should validate strong passwords', () => {
      const result = validators.password('StrongP@ssw0rd!')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('strong')
    })

    it('should reject weak passwords', () => {
      const result = validators.password('weak')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('weak')
    })

    it('should require minimum length', () => {
      const result = validators.password('short')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('8 characters')
    })
  })

  describe('name', () => {
    it('should validate proper names', () => {
      const result = validators.name('John Doe', 'First name')
      expect(result.isValid).toBe(true)
      expect(result.error).toBe('')
    })

    it('should reject names with numbers', () => {
      const result = validators.name('John123', 'First name')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('letters')
    })

    it('should require minimum length', () => {
      const result = validators.name('J', 'First name')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('2 characters')
    })
  })

  describe('age', () => {
    it('should validate proper ages', () => {
      const result = validators.age(25)
      expect(result.isValid).toBe(true)
      expect(result.error).toBe('')
    })

    it('should reject ages under 13', () => {
      const result = validators.age(12)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('13 years old')
    })

    it('should reject invalid ages', () => {
      const result = validators.age('invalid')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('valid number')
    })
  })
})

describe('sanitizers', () => {
  describe('string', () => {
    it('should trim whitespace', () => {
      const result = sanitizers.string('  hello world  ')
      expect(result).toBe('hello world')
    })

    it('should remove null bytes', () => {
      const result = sanitizers.string('hello\x00world')
      expect(result).toBe('helloworld')
    })

    it('should limit length when specified', () => {
      const result = sanitizers.string('very long string', 5)
      expect(result).toBe('very ')
    })
  })

  describe('email', () => {
    it('should lowercase and trim email', () => {
      const result = sanitizers.email('  TEST@EXAMPLE.COM  ')
      expect(result).toBe('test@example.com')
    })
  })

  describe('name', () => {
    it('should capitalize names properly', () => {
      const result = sanitizers.name('john   doe')
      expect(result).toBe('John Doe')
    })
  })
})

describe('validateForm', () => {
  it('should validate entire form with rules', () => {
    const formData = {
      email: 'test@example.com',
      name: 'John Doe'
    }

    const rules = {
      email: 'email',
      name: (value) => validators.name(value, 'Name')
    }

    const result = validateForm(formData, rules)
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  it('should return errors for invalid form', () => {
    const formData = {
      email: 'invalid-email',
      name: 'J'
    }

    const rules = {
      email: 'email',
      name: (value) => validators.name(value, 'Name')
    }

    const result = validateForm(formData, rules)
    expect(result.isValid).toBe(false)
    expect(result.errors.email).toBeDefined()
    expect(result.errors.name).toBeDefined()
  })
})