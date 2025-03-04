import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; 
import { injectRuntimeConfig } from './lib/config';
import { createClient } from '@supabase/supabase-js';

// Inject runtime configuration
injectRuntimeConfig();

// Test Supabase connection
const testSupabaseConnection = async () => {
  // Get config from window.__CONFIG__
  const supabaseUrl = window.__CONFIG__.SUPABASE_URL;
  const supabaseKey = window.__CONFIG__.SUPABASE_ANON_KEY;
  
  console.log('Main: Testing Supabase connection with:', {
    url: supabaseUrl,
    keyLength: supabaseKey ? supabaseKey.length : 0
  });
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Main: Missing Supabase credentials!');
    return;
  }
  
  try {
    const testClient = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await testClient.from('cars').select('count').limit(1);
    
    if (error) {
      console.error('Main: Supabase connection test FAILED:', error.message);
    } else {
      console.log('Main: Supabase connection test SUCCESS:', data);
    }
  } catch (err) {
    console.error('Main: Supabase connection test EXCEPTION:', err);
  }
};

// Run the test
testSupabaseConnection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
