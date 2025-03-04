-- Mevcut bookings tablosunu kaldır
DROP TABLE IF EXISTS bookings CASCADE;

-- Yeni basitleştirilmiş bookings tablosunu oluştur
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID NOT NULL REFERENCES cars(id),
  trip_type VARCHAR(20) NOT NULL CHECK (trip_type IN ('oneWay', 'roundTrip')),
  pickup_location VARCHAR(255) NOT NULL,
  dropoff_location VARCHAR(255) NOT NULL,
  pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
  return_date TIMESTAMP WITH TIME ZONE,
  return_pickup_location VARCHAR(255),
  return_dropoff_location VARCHAR(255),
  passengers INTEGER NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  notes TEXT,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gerekli indeksleri oluştur
CREATE INDEX idx_bookings_car_id ON bookings(car_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_pickup_date ON bookings(pickup_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Bookings tablosu için RLS (Row Level Security) politikalarını ayarla
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcılar tüm rezervasyonları görebilir ve düzenleyebilir
CREATE POLICY "bookings_admin_policy" 
ON bookings 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Kullanıcılar sadece kendi rezervasyonlarını görebilir
CREATE POLICY "bookings_user_policy" 
ON bookings 
FOR SELECT 
USING (email = auth.jwt() ->> 'email'); 