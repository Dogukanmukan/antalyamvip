import { createClient } from '@supabase/supabase-js';

// Supabase URL ve anon key değerlerini çevre değişkenlerinden alıyoruz
// Bu değerler .env dosyasında tanımlanmalıdır
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Supabase istemcisini oluşturuyoruz
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
