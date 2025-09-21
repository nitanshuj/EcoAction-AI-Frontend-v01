import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const sessionInitialized = ref(false)

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
   * Fetch user profile data
   */
  const fetchUserProfile = async (userId = null) => {
    try {
      const targetUserId = userId || user.value?.id
      if (!targetUserId) return null

      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (profileError) {
        console.warn('Profile fetch error:', profileError)
        return null
      }

      profile.value = data
      return data
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }

  /**
   * Sign up new user with profile creation
   */
  const signUp = async (email, password, userData) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      })

      if (signUpError) throw signUpError

      // If user is created immediately (no email confirmation required)
      if (data.user && !data.user.email_confirmed_at) {
        user.value = data.user

        // Create user profile
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              first_name: userData.firstName,
              last_name: userData.lastName,
              age: userData.age,
              onboarding_status: false,
              created_at: new Date().toISOString()
            })

          if (profileError) {
            console.warn('Profile creation error:', profileError)
          }
        } catch (profileErr) {
          console.warn('Profile creation failed:', profileErr)
        }
      }

      return {
        success: true,
        message: data.user?.email_confirmed_at
          ? 'Account created successfully!'
          : 'Account created! Please check your email for verification.'
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
   * Sign in existing user
   */
  const signIn = async (email, password) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (signInError) throw signInError

      user.value = data.user

      // Fetch user profile
      if (data.user) {
        await fetchUserProfile(data.user.id)
      }

      return { success: true, message: 'Successfully signed in!' }
    } catch (err) {
      const errorMessage = handleAuthError(err)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Sign out current user
   */
  const signOut = async () => {
    loading.value = true
    error.value = null

    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

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
   * Reset password
   */
  const resetPassword = async (email) => {
    loading.value = true
    error.value = null

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      )

      if (resetError) throw resetError

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
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
   * Initialize authentication state
   */
  const initializeAuth = async () => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.warn('Session error:', sessionError)
      }

      user.value = session?.user || null

      // Fetch profile if user exists
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        user.value = session?.user || null

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          profile.value = null
        }

        // Clear error on successful auth state change
        if (event === 'SIGNED_IN') {
          error.value = null
        }
      })

      sessionInitialized.value = true
    } catch (err) {
      console.error('Auth initialization error:', err)
      sessionInitialized.value = true
    }
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