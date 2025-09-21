import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const sessionInitialized = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Handle authentication errors with user-friendly messages
   */
  const handleAuthError = (err) => {
    const message = err.message?.toLowerCase() || ''

    if (message.includes('user already registered') || message.includes('already been registered')) {
      return 'An account with this email already exists. Please try signing in instead.'
    } else if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.'
    } else if (message.includes('email not confirmed')) {
      return 'Please verify your email address before signing in.'
    } else if (message.includes('password') && (message.includes('weak') || message.includes('short'))) {
      return 'Password is too weak. Please choose a stronger password.'
    } else if (message.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.'
    } else if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    } else {
      return err.message || 'An unexpected error occurred. Please try again.'
    }
  }

  /**
   * Mock user profile data
   */
  const createMockProfile = (email, userData) => {
    return {
      id: Date.now().toString(),
      email: email,
      first_name: userData?.firstName || 'Demo',
      last_name: userData?.lastName || 'User',
      age: userData?.age || 25,
      onboarding_status: false,
      created_at: new Date().toISOString()
    }
  }

  /**
   * Sign up new user (mock implementation)
   */
  const signUp = async (email, password, userData) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create mock user and profile
      const mockUser = {
        id: Date.now().toString(),
        email: email.trim().toLowerCase(),
        email_confirmed_at: new Date().toISOString()
      }

      user.value = mockUser
      profile.value = createMockProfile(email, userData)

      return {
        success: true,
        message: 'Account created successfully! (Demo Mode)'
      }
    } catch (err) {
      const errorMessage = handleAuthError(err)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign in existing user (mock implementation)
   */
  const signIn = async (email, password) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Accept any credentials for demo
      const mockUser = {
        id: Date.now().toString(),
        email: email.trim().toLowerCase(),
        email_confirmed_at: new Date().toISOString()
      }

      user.value = mockUser
      profile.value = createMockProfile(email)

      return { success: true, message: 'Successfully signed in! (Demo Mode)' }
    } catch (err) {
      const errorMessage = handleAuthError(err)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign out current user (mock implementation)
   */
  const signOut = async () => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      user.value = null
      profile.value = null
      return { success: true, message: 'Successfully signed out!' }
    } catch (err) {
      const errorMessage = handleAuthError(err)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset password (mock implementation)
   */
  const resetPassword = async (email) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        message: 'Password reset email sent! (Demo Mode - Check console)'
      }
    } catch (err) {
      const errorMessage = handleAuthError(err)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Initialize authentication state (mock implementation)
   */
  const initializeAuth = async () => {
    // In demo mode, no initialization needed
    sessionInitialized.value = true
  }

  /**
   * Fetch user profile data (mock implementation)
   */
  const fetchUserProfile = async (userId = null) => {
    // Return existing profile or null
    return profile.value
  }

  return {
    // State
    user,
    profile,
    loading,
    error,
    sessionInitialized,

    // Computed
    isAuthenticated,
    isLoading,
    hasError,

    // Actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    initializeAuth,
    fetchUserProfile,
    clearError
  }
})