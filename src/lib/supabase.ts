import { createClient } from '@supabase/supabase-js';
import { config, getRuntimeConfig } from './config';

// Get Supabase configuration from runtime config when available
const supabaseUrl = typeof window !== 'undefined' 
  ? getRuntimeConfig('SUPABASE_URL') 
  : config.supabase.url;

const supabaseAnonKey = typeof window !== 'undefined'
  ? getRuntimeConfig('SUPABASE_ANON_KEY')
  : config.supabase.anonKey;

// Log configuration for debugging
console.log('Main Supabase Config:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  environment: typeof window !== 'undefined' ? 'browser' : 'server'
});

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
