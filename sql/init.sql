-- Stored procedure to create users table
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to create cars table
CREATE OR REPLACE FUNCTION create_cars_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    images TEXT[] NOT NULL,
    year INTEGER NOT NULL,
    fuel_type VARCHAR(255) NOT NULL,
    seats INTEGER NOT NULL,
    features TEXT[] NOT NULL,
    price_per_day INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to create bookings table
CREATE OR REPLACE FUNCTION create_bookings_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    trip_type VARCHAR(20) NOT NULL DEFAULT 'oneWay', -- 'oneWay' veya 'roundTrip'
    -- Gidiş yolculuğu
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    -- Dönüş yolculuğu (roundTrip için)
    return_pickup_location VARCHAR(255),
    return_dropoff_location VARCHAR(255),
    return_date TIMESTAMP WITH TIME ZONE,
    -- Diğer bilgiler
    passengers INTEGER NOT NULL,
    car_id INTEGER REFERENCES cars(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;
