-- Araç Kiralama Sistemi için Veritabanı Kurulumu

-- UUID uzantısını etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100),
  password VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Araçlar Tablosu
CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER,
  category VARCHAR(50),
  fuel_type VARCHAR(50),
  seats INTEGER NOT NULL,
  luggage INTEGER,
  price_per_day DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255),
  images JSONB DEFAULT '[]'::JSONB,
  features JSONB DEFAULT '[]'::JSONB,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'unavailable')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Rezervasyonlar Tablosu
CREATE TABLE IF NOT EXISTS bookings (
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
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Dosyalar Tablosu
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  path VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL,
  type VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. İndeksler
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_files_entity ON files(entity_type, entity_id);

-- 6. Örnek Veriler

-- Admin Kullanıcısı
INSERT INTO users (email, username, role, password)
VALUES ('admin@alanyamvip.com', 'admin', 'admin', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC')
ON CONFLICT (email) DO NOTHING;

-- Örnek Araçlar
INSERT INTO cars (name, make, model, year, category, fuel_type, seats, luggage, price_per_day, status, features, description, image)
VALUES 
  ('Mercedes Vito VIP', 'Mercedes-Benz', 'Vito', 2023, 'luxury', 'diesel', 8, 6, 250.00, 'active', '["Deri koltuklar", "Klima", "Bluetooth", "GPS Navigasyon"]', 'Lüks ve konforlu bir yolculuk için ideal araç.', '/images/cars/vito.jpg'),
  ('Mercedes Sprinter', 'Mercedes-Benz', 'Sprinter', 2022, 'van', 'diesel', 16, 10, 350.00, 'active', '["Klima", "Bluetooth", "Geniş bagaj alanı", "Konforlu koltuklar"]', 'Kalabalık gruplar için geniş ve konforlu minibüs.', '/images/cars/sprinter.jpg'),
  ('Mercedes V-Class', 'Mercedes-Benz', 'V-Class', 2023, 'luxury', 'diesel', 7, 5, 300.00, 'active', '["Deri koltuklar", "Panoramik tavan", "Klima", "Bluetooth", "GPS Navigasyon"]', 'Üst düzey konfor ve lüks sunan premium araç.', '/images/cars/vclass.jpg')
ON CONFLICT DO NOTHING;

-- 7. Tetikleyiciler

-- updated_at alanını güncelleyen fonksiyon
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tetikleyiciler
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at
BEFORE UPDATE ON cars
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at
BEFORE UPDATE ON files
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 