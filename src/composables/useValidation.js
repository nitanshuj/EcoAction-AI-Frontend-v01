/**
 * Vue composition API for form validation
 */
import { ref, reactive, computed } from 'vue'
import { validators, sanitizers, validateForm } from '@/utils/validation'

export function useValidation() {
  const errors = reactive({})
  const touched = reactive({})
  const isSubmitting = ref(false)

  /**
   * Validate a single field
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @param {string|Function|Array} rule - Validation rule(s)
   */
  const validateField = (field, value, rule) => {
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

    if (result) {
      if (!result.isValid) {
        errors[field] = result.error
      } else {
        delete errors[field]
      }
    }

    return result
  }

  /**
   * Mark field as touched
   * @param {string} field - Field name
   */
  const touchField = (field) => {
    touched[field] = true
  }

  /**
   * Check if field has error and is touched
   * @param {string} field - Field name
   */
  const fieldHasError = (field) => {
    return touched[field] && errors[field]
  }

  /**
   * Get error message for field
   * @param {string} field - Field name
   */
  const getFieldError = (field) => {
    return fieldHasError(field) ? errors[field] : ''
  }

  /**
   * Clear all errors and touched state
   */
  const clearValidation = () => {
    Object.keys(errors).forEach(key => delete errors[key])
    Object.keys(touched).forEach(key => delete touched[key])
  }

  /**
   * Check if form is valid (no errors)
   */
  const isValid = computed(() => {
    return Object.keys(errors).length === 0
  })

  /**
   * Check if any field has been touched
   */
  const hasBeenTouched = computed(() => {
    return Object.keys(touched).length > 0
  })

  return {
    errors,
    touched,
    isSubmitting,
    validateField,
    touchField,
    fieldHasError,
    getFieldError,
    clearValidation,
    isValid,
    hasBeenTouched,
    validators,
    sanitizers,
    validateForm
  }
}

/**
 * Composable for auth form validation
 */
export function useAuthValidation() {
  const validation = useValidation()

  const signUpRules = {
    email: 'email',
    password: 'password',
    confirmPassword: (value, formData) => validation.validators.confirmPassword(formData.password, value),
    firstName: (value) => validation.validators.name(value, 'First name'),
    lastName: (value) => validation.validators.name(value, 'Last name'),
    age: 'age'
  }

  const signInRules = {
    email: 'email',
    password: (value) => {
      if (!value) return { isValid: false, error: 'Password is required' }
      return { isValid: true, error: '' }
    }
  }

  const validateSignUp = (formData) => {
    return validation.validateForm(formData, signUpRules)
  }

  const validateSignIn = (formData) => {
    return validation.validateForm(formData, signInRules)
  }

  return {
    ...validation,
    signUpRules,
    signInRules,
    validateSignUp,
    validateSignIn
  }
}