-- Admin Kullanıcısı Oluşturma
-- Bu SQL dosyası, admin rolüne sahip bir kullanıcı oluşturur

-- Önce auth.users tablosuna admin kullanıcısı ekleyelim
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'admin@alanyamvip.com',
  crypt('Admin123!', gen_salt('bf')), -- Şifre: Admin123!
  now(),
  'authenticated',
  '{"provider": "email", "providers": ["email"], "role": "admin"}',
  '{"name": "Admin User"}',
  now(),
  now(),
  '',
  ''
);

-- Şimdi public.users tablosuna da ekleyelim
INSERT INTO public.users (
  id,
  email,
  username,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@alanyamvip.com'),
  'admin@alanyamvip.com',
  'admin',
  'admin',
  now(),
  now()
);

-- Admin kullanıcısına özel izinler vermek için
-- Eğer özel bir rol tablosu kullanıyorsanız, burada ekleyebilirsiniz 