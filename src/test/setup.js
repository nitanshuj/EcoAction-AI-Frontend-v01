/**
 * Test setup file for Vitest
 */
import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'

// Global test configuration
config.global.plugins = [createPinia()]

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_ENVIRONMENT: 'test'
  },
  writable: false
})

// Mock console methods in tests
global.console = {
  ...console,
  // Suppress console.log in tests
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}