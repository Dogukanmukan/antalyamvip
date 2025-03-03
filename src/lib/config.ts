// API ve diğer yapılandırmalar
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://antalyamvip.vercel.app/api'
  : 'http://localhost:3001/api';

// Supabase yapılandırması
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''; 