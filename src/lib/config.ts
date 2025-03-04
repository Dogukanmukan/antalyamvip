// Environment configuration
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://exdgeyldiufinjgwkeqy.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGdleWxkaXVmaW5qZ3drZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjYyOTgsImV4cCI6MjA1NjY0MjI5OH0.6_-UHxCaWL8twSGkHZQulQCSwvpvIMVVJ7ngSUnuQDc',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Alanyam VIP',
    url: import.meta.env.VITE_APP_URL || 'https://alanyamvip.com',
  },
};

// Runtime configuration - this will be injected into the window object during build
// This ensures environment variables are available at runtime in production
export function injectRuntimeConfig() {
  // Create a global window.__CONFIG__ object
  if (typeof window !== 'undefined') {
    window.__CONFIG__ = {
      SUPABASE_URL: config.supabase.url,
      SUPABASE_ANON_KEY: config.supabase.anonKey,
      API_BASE_URL: config.api.baseUrl,
      APP_NAME: config.app.name,
      APP_URL: config.app.url,
    };
    
    // Log configuration for debugging
    console.log('Runtime Config Injected:', {
      SUPABASE_URL: config.supabase.url,
      SUPABASE_ANON_KEY_LENGTH: config.supabase.anonKey ? config.supabase.anonKey.length : 0,
      API_BASE_URL: config.api.baseUrl,
    });
  }
}

// Type definition for the global window object
declare global {
  interface Window {
    __CONFIG__: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      API_BASE_URL: string;
      APP_NAME: string;
      APP_URL: string;
    };
  }
}

// Export a function to get runtime config values
export function getRuntimeConfig(key: keyof Window['__CONFIG__']) {
  // Debug log for tracking config access
  console.log(`Getting runtime config for: ${key}`);
  
  // Check if window is defined (browser environment)
  if (typeof window !== 'undefined') {
    // Check if __CONFIG__ is initialized
    if (!window.__CONFIG__) {
      console.warn('Runtime config not initialized! Injecting now...');
      injectRuntimeConfig();
    }
    
    // Get value from window.__CONFIG__
    const value = window.__CONFIG__[key];
    console.log(`Runtime config value for ${key}:`, key.includes('KEY') ? `[length: ${value?.length || 0}]` : value);
    return value;
  }
  
  // Fallback to build-time config for server-side rendering
  console.log(`Using build-time config for ${key} (server-side)`);
  switch (key) {
    case 'SUPABASE_URL': return config.supabase.url;
    case 'SUPABASE_ANON_KEY': return config.supabase.anonKey;
    case 'API_BASE_URL': return config.api.baseUrl;
    case 'APP_NAME': return config.app.name;
    case 'APP_URL': return config.app.url;
    default: return undefined;
  }
}

// Konsola bilgi yazdır (geliştirme sırasında yardımcı olur)
console.log('Supabase Config:', { 
  url: config.supabase.url === 'https://exdgeyldiufinjgwkeqy.supabase.co' ? 'Using DEFAULT URL' : 'Using ENV URL',
  key: config.supabase.anonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGdleWxkaXVmaW5qZ3drZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjYyOTgsImV4cCI6MjA1NjY0MjI5OH0.6_-UHxCaWL8twSGkHZQulQCSwvpvIMVVJ7ngSUnuQDc' ? 'Using DEFAULT KEY' : 'Using ENV KEY'
}); 