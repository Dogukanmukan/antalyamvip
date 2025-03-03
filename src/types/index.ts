// Araç tipi tanımı
export interface Car {
  id: number;
  name: string;
  category: string;
  description?: string;
  year: number;
  seats: number;
  fuel_type: string;
  image?: string; // Ana resim (geriye dönük uyumluluk için)
  images: string[];
  features: string[];
  price_per_day: number;
  created_at?: string;
  updated_at?: string;
}

// Kullanıcı tipi tanımı
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at?: string;
}

// Rezervasyon tipi tanımı
export interface Booking {
  id: number;
  trip_type: 'oneWay' | 'roundTrip';
  car_id: number;
  // Gidiş bilgileri
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  // Dönüş bilgileri (yalnızca roundTrip için)
  return_pickup_location?: string;
  return_dropoff_location?: string;
  return_date?: string;
  // Diğer detaylar
  passengers: number;
  full_name: string;
  email: string;
  phone: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at?: string;
  updated_at?: string;
  cars?: Car; // İlişkili araç bilgisi
}

// Rezervasyon formu veri tipi
export interface BookingFormData {
  tripType: 'oneWay' | 'roundTrip';
  // Gidiş bilgileri
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  // Dönüş bilgileri
  returnPickupLocation: string;
  returnDropoffLocation: string;
  returnDate: string;
  returnTime: string;
  // Diğer detaylar
  passengers: number;
  contactInfo: {
    fullName: string;
    phone: string;
    email: string;
    notes?: string;
  }
}