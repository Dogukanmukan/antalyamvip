import { Booking, Car } from './supabase';

/**
 * Helper functions to convert between old API format and new Supabase format
 */

// Convert old booking format to Supabase format
export const convertOldBookingToSupabase = (oldBooking: any): Partial<Booking> => {
  return {
    id: oldBooking.id?.toString(),
    trip_type: oldBooking.trip_type || 'oneWay',
    pickup_location: oldBooking.pickup_location,
    dropoff_location: oldBooking.dropoff_location,
    pickup_date: oldBooking.pickup_date,
    return_pickup_location: oldBooking.return_pickup_location,
    return_dropoff_location: oldBooking.return_dropoff_location,
    return_date: oldBooking.return_date,
    passengers: parseInt(oldBooking.passengers) || 1,
    car_id: oldBooking.car_id?.toString(),
    full_name: oldBooking.full_name || oldBooking.customer,
    email: oldBooking.email,
    phone: oldBooking.phone,
    notes: oldBooking.notes,
    status: oldBooking.status || 'pending',
    created_at: oldBooking.created_at || new Date().toISOString()
  };
};

// Convert Supabase booking to old format (for backward compatibility)
export const convertSupabaseBookingToOld = (booking: Booking): any => {
  return {
    id: booking.id,
    trip_type: booking.trip_type,
    pickup_location: booking.pickup_location,
    dropoff_location: booking.dropoff_location,
    pickup_date: booking.pickup_date,
    return_pickup_location: booking.return_pickup_location,
    return_dropoff_location: booking.return_dropoff_location,
    return_date: booking.return_date,
    passengers: booking.passengers,
    car_id: booking.car_id,
    customer: booking.full_name,
    full_name: booking.full_name,
    email: booking.email,
    phone: booking.phone,
    notes: booking.notes,
    status: booking.status,
    created_at: booking.created_at,
    car: booking.car ? {
      id: booking.car.id,
      name: booking.car.name,
      category: booking.car.category,
      image: booking.car.image,
      price_per_day: booking.car.price_per_day
    } : undefined
  };
};

// Convert old car format to Supabase format
export const convertOldCarToSupabase = (oldCar: any): Partial<Car> => {
  return {
    id: oldCar.id?.toString(),
    name: oldCar.name,
    category: oldCar.category,
    image: oldCar.image,
    images: oldCar.images,
    year: oldCar.year ? parseInt(oldCar.year) : undefined,
    fuel_type: oldCar.fuel_type,
    seats: parseInt(oldCar.seats) || parseInt(oldCar.passengers) || 4,
    features: oldCar.features,
    price_per_day: parseFloat(oldCar.price_per_day) || parseFloat(oldCar.price) || 0,
    created_at: oldCar.created_at || new Date().toISOString()
  };
};

// Convert Supabase car to old format (for backward compatibility)
export const convertSupabaseCarToOld = (car: Car): any => {
  return {
    id: car.id,
    name: car.name,
    category: car.category,
    image: car.image,
    images: car.images,
    year: car.year,
    fuel_type: car.fuel_type,
    seats: car.seats,
    passengers: car.seats, // For backward compatibility
    features: car.features,
    price: car.price_per_day,
    price_per_day: car.price_per_day,
    created_at: car.created_at
  };
};

// Helper to safely parse JSON
export const safeJsonParse = (jsonString: string | null | undefined, defaultValue: any = null): any => {
  if (!jsonString) return defaultValue;
  
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}; 