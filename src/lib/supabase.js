/**
 * Supabase client configuration with environment validation
 */
import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

if (supabaseUrl.includes('your_supabase_url_here')) {
  throw new Error('Please set a valid VITE_SUPABASE_URL in your .env file')
}

if (supabaseAnonKey.includes('your_supabase_anon_key_here')) {
  throw new Error('Please set a valid VITE_SUPABASE_ANON_KEY in your .env file')
}

// Create Supabase client with configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'ecoaction-ai-vue@1.0.0'
    }
  }
})

// Export environment configuration
export const config = {
  supabaseUrl,
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true'
}