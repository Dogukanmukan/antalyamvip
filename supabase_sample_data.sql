-- Örnek Veri Ekleme Sorguları
-- Bu SQL dosyası, veritabanı tablolarınız için örnek veriler ekler

-- Araçlar (Cars) için örnek veriler
INSERT INTO cars (
  id,
  name,
  make,
  model,
  year,
  category,
  fuel_type,
  seats,
  features,
  price_per_day,
  status,
  image,
  images,
  description
) VALUES (
  gen_random_uuid(),
  'Mercedes Vito VIP',
  'Mercedes-Benz',
  'Vito',
  2023,
  'luxury',
  'diesel',
  8,
  '["Klima", "Deri Koltuk", "Bluetooth", "Navigasyon", "Bagaj", "Wi-Fi"]',
  1200,
  'active',
  'https://exdgeyldiufinjgwkeqy.supabase.co/storage/v1/object/public/car-images/vito.jpg',
  '["https://exdgeyldiufinjgwkeqy.supabase.co/storage/v1/object/public/car-images/vito.jpg", "https://exdgeyldiufinjgwkeqy.supabase.co/storage/v1/object/public/car-images/vito-interior.jpg"]',
  'Lüks seyahat için tasarlanmış Mercedes Vito VIP, 8 kişilik kapasitesi ve konforlu iç mekanı ile grup seyahatleri için idealdir.'
);

INSERT INTO cars (
  id,
  name,
  make,
  model,
  year,
  category,
  fuel_type,
  seats,
  features,
  price_per_day,
  status,
  image,
  images,
  description
) VALUES (
  gen_random_uuid(),
  'Mercedes Sprinter',
  'Mercedes-Benz',
  'Sprinter',
  2022,
  'minibus',
  'diesel',
  16,
  '["Klima", "Geniş Bagaj", "USB Şarj", "Yüksek Tavan", "Konforlu Koltuklar", "Buzdolabı"]',
  1800,
  'active',
  'https://exdgeyldiufinjgwkeqy.supabase.co/storage/v1/object/public/car-images/sprinter.jpg',
  '["https://exdgeyldiufinjgwkeqy.supabase.co/storage/v1/object/public/car-images/sprinter.jpg", "https://exdgeyldiufinjgwkeqy.supabase.co/storage/v1/object/public/car-images/sprinter-interior.jpg"]',
  'Büyük gruplar için ideal olan Mercedes Sprinter, 16 kişilik kapasitesi ve geniş bagaj alanı ile konforlu bir seyahat deneyimi sunar.'
);

-- Rezervasyonlar (Bookings) için örnek veriler
-- İlk araç için rezervasyon
INSERT INTO bookings (
  id,
  trip_type,
  pickup_location,
  dropoff_location,
  pickup_date,
  return_date,
  return_pickup_location,
  return_dropoff_location,
  passengers,
  car_id,
  full_name,
  email,
  phone,
  notes,
  status,
  total_price
) VALUES (
  gen_random_uuid(),
  'oneWay',
  'Antalya Havalimanı',
  'Alanya Merkez',
  '2024-07-15 14:30:00',
  NULL,
  NULL,
  NULL,
  4,
  (SELECT id FROM cars WHERE name = 'Mercedes Vito VIP' LIMIT 1),
  'Ahmet Yılmaz',
  'ahmet.yilmaz@example.com',
  '+90 555 123 4567',
  'Uçuş numarası: TK1234, 14:00 iniş saati',
  'confirmed',
  1200
);

-- İkinci araç için rezervasyon
INSERT INTO bookings (
  id,
  trip_type,
  pickup_location,
  dropoff_location,
  pickup_date,
  return_date,
  return_pickup_location,
  return_dropoff_location,
  passengers,
  car_id,
  full_name,
  email,
  phone,
  notes,
  status,
  total_price
) VALUES (
  gen_random_uuid(),
  'roundTrip',
  'Antalya Havalimanı',
  'Belek',
  '2024-07-20 10:00:00',
  '2024-07-27 16:00:00',
  'Belek',
  'Antalya Havalimanı',
  12,
  (SELECT id FROM cars WHERE name = 'Mercedes Sprinter' LIMIT 1),
  'Mehmet Kaya',
  'mehmet.kaya@example.com',
  '+90 555 987 6543',
  'Grup transferi, 12 kişi, 15 büyük bavul',
  'pending',
  12600
); 