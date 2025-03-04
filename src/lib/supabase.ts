import { createClient } from '@supabase/supabase-js';
import { config, getRuntimeConfig } from './config';

// Get Supabase configuration from runtime config when available
const supabaseUrl = typeof window !== 'undefined' 
  ? getRuntimeConfig('SUPABASE_URL') 
  : config.supabase.url;

const supabaseAnonKey = typeof window !== 'undefined'
  ? getRuntimeConfig('SUPABASE_ANON_KEY')
  : config.supabase.anonKey;

// Ensure we have valid Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: Missing Supabase credentials in lib/supabase.ts', {
    url: supabaseUrl ? 'defined' : 'undefined',
    key: supabaseAnonKey ? 'defined (length: ' + supabaseAnonKey.length + ')' : 'undefined'
  });
}

// Log configuration for debugging
console.log('Main Supabase Client Initializing:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  environment: typeof window !== 'undefined' ? 'browser' : 'server'
});

// Create Supabase client with detailed options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Test the connection
(async () => {
  try {
    const { data, error } = await supabase.from('cars').select('count').limit(1);
    if (error) {
      console.error('Main Supabase connection test failed:', error.message);
    } else {
      console.log('Main Supabase connection test successful:', data);
    }
  } catch (err) {
    console.error('Main Supabase connection test exception:', err);
  }
})();
