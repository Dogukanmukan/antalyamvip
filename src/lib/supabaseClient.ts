import { createClient } from '@supabase/supabase-js';
import { getRuntimeConfig } from './config';

// Supabase URL ve Anon Key'i config'den al
const supabaseUrl = getRuntimeConfig('SUPABASE_URL');
const supabaseAnonKey = getRuntimeConfig('SUPABASE_ANON_KEY');

// Supabase client'ı oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Konsola bilgi yazdır (geliştirme sırasında yardımcı olur)
console.log('Supabase Client initialized with URL:', supabaseUrl); 