// API ve diğer yapılandırmalar
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://antalyamvip.vercel.app/api'
  : 'http://localhost:3001/api';

// Supabase yapılandırması - varsayılan değerlerle
const DEFAULT_SUPABASE_URL = 'https://exdgeyldiufinjgwkeqy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGdleWxkaXVmaW5qZ3drZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjYyOTgsImV4cCI6MjA1NjY0MjI5OH0.6_-UHxCaWL8twSGkHZQulQCSwvpvIMVVJ7ngSUnuQDc';

// Çevre değişkenlerini veya varsayılan değerleri kullan
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Konsola bilgi yazdır (geliştirme sırasında yardımcı olur)
console.log('Supabase Config:', { 
  url: SUPABASE_URL === DEFAULT_SUPABASE_URL ? 'Using DEFAULT URL' : 'Using ENV URL',
  key: SUPABASE_ANON_KEY === DEFAULT_SUPABASE_ANON_KEY ? 'Using DEFAULT KEY' : 'Using ENV KEY'
}); 