-- Simplified Bookings Table Schema
ALTER TABLE bookings DROP COLUMN IF EXISTS updated_at;

-- If you want to recreate the table completely, use this instead:
/*
DROP TABLE IF EXISTS bookings;

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

-- Create necessary indexes
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON bookings(pickup_date);
*/ 