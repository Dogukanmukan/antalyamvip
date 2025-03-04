import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// Supabase URL ve anahtarının varlığını kontrol et
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL veya Anon Key tanımlanmamış!', {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY ? 'Tanımlı' : 'Tanımsız'
  });
}

// Supabase istemcisini oluşturuyoruz
export const supabase = createClient(
  SUPABASE_URL || 'https://exdgeyldiufinjgwkeqy.supabase.co',
  SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGdleWxkaXVmaW5qZ3drZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjYyOTgsImV4cCI6MjA1NjY0MjI5OH0.6_-UHxCaWL8twSGkHZQulQCSwvpvIMVVJ7ngSUnuQDc'
);
