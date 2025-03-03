import { createClient } from '@supabase/supabase-js';

// Supabase URL ve anon key değerlerini çevre değişkenlerinden alıyoruz
// Bu değerler .env dosyasında tanımlanmalıdır
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase istemcisini oluşturuyoruz
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
