export interface BookingFormData {
  tripType: 'oneWay' | 'roundTrip';
  // Outbound journey
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  // Return journey
  returnPickupLocation: string;
  returnDropoffLocation: string;
  returnDate: string;
  returnTime: string;
  // Other details
  passengers: number;
  contactInfo: {
    fullName: string;
    phone: string;
    email: string;
    notes?: string;
  }
}
