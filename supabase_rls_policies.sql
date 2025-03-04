-- Supabase RLS (Row Level Security) Politikaları
-- Bu SQL dosyası, veritabanı tablolarınız için güvenlik politikalarını tanımlar

-- RLS'yi tüm tablolar için etkinleştir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "users_admin_policy" ON users;
DROP POLICY IF EXISTS "cars_admin_policy" ON cars;
DROP POLICY IF EXISTS "cars_public_read_policy" ON cars;
DROP POLICY IF EXISTS "bookings_admin_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_user_policy" ON bookings;
DROP POLICY IF EXISTS "files_admin_policy" ON files;
DROP POLICY IF EXISTS "files_public_read_policy" ON files;

-- USERS tablosu için politikalar
-- Admin kullanıcılar tüm kullanıcıları görebilir ve düzenleyebilir
CREATE POLICY "users_admin_policy" 
ON users 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- CARS tablosu için politikalar
-- Admin kullanıcılar tüm araçları görebilir ve düzenleyebilir
CREATE POLICY "cars_admin_policy" 
ON cars 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Herkes aktif araçları görebilir (sadece okuma)
CREATE POLICY "cars_public_read_policy" 
ON cars 
FOR SELECT 
USING (status = 'active' OR auth.jwt() ->> 'role' = 'admin');

-- BOOKINGS tablosu için politikalar
-- Admin kullanıcılar tüm rezervasyonları görebilir ve düzenleyebilir
CREATE POLICY "bookings_admin_policy" 
ON bookings 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Kullanıcılar kendi rezervasyonlarını görebilir ve düzenleyebilir
CREATE POLICY "bookings_user_policy" 
ON bookings 
USING (email = auth.jwt() ->> 'email')
WITH CHECK (email = auth.jwt() ->> 'email');

-- Anonim kullanıcılar rezervasyon oluşturabilir
CREATE POLICY "bookings_insert_policy" 
ON bookings 
FOR INSERT 
WITH CHECK (true);

-- FILES tablosu için politikalar
-- Admin kullanıcılar tüm dosyaları görebilir ve düzenleyebilir
CREATE POLICY "files_admin_policy" 
ON files 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Herkes dosyaları görebilir (sadece okuma)
CREATE POLICY "files_public_read_policy" 
ON files 
FOR SELECT 
USING (true);

-- Admin rolü için özel fonksiyon
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcı rolü için özel fonksiyon
CREATE OR REPLACE FUNCTION is_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') = 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Anonim erişim için özel fonksiyon
CREATE OR REPLACE FUNCTION is_anon()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') IS NULL OR (auth.jwt() ->> 'role') = 'anon';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcı kimliğini döndüren fonksiyon
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'sub')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcı e-postasını döndüren fonksiyon
CREATE OR REPLACE FUNCTION auth_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 