export interface BookingFormData {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  passengers: number;
  contactInfo: {
    fullName: string;
    phone: string;
    email: string;
    notes?: string;
  }
}
