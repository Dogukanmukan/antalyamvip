// Form doğrulama yardımcı fonksiyonları

// E-posta doğrulama
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Boş alan kontrolü
export const isNotEmpty = (value: string): boolean => {
  return value.trim() !== '';
};

// Minimum uzunluk kontrolü
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

// Sayı kontrolü
export const isNumber = (value: string): boolean => {
  return !isNaN(Number(value));
};

// Pozitif sayı kontrolü
export const isPositiveNumber = (value: string): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

// Tarih formatı kontrolü (GG.AA.YYYY)
export const isValidDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  return dateRegex.test(date);
};

// Saat formatı kontrolü (SS:DD)
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Telefon numarası formatı kontrolü
export const isValidPhoneNumber = (phone: string): boolean => {
  // Türkiye telefon numarası formatı için basit bir regex
  // +90 555 123 4567 veya 0555 123 4567 formatlarını kabul eder
  const phoneRegex = /^(\+90|0)?\s*(\d{3})\s*(\d{3})\s*(\d{2})\s*(\d{2})$/;
  return phoneRegex.test(phone);
};

// Form doğrulama sonucu için tip
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Araç formu doğrulama
export const validateCarForm = (values: any): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!isNotEmpty(values.name)) {
    errors.name = 'Araç adı boş olamaz';
  }
  
  if (!isNotEmpty(values.category)) {
    errors.category = 'Kategori boş olamaz';
  }
  
  if (!isPositiveNumber(values.passengers.toString())) {
    errors.passengers = 'Yolcu sayısı pozitif bir sayı olmalıdır';
  }
  
  if (!isPositiveNumber(values.luggage.toString())) {
    errors.luggage = 'Bagaj kapasitesi pozitif bir sayı olmalıdır';
  }
  
  if (!isPositiveNumber(values.price.toString())) {
    errors.price = 'Fiyat pozitif bir sayı olmalıdır';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Rezervasyon formu doğrulama
export const validateBookingForm = (values: any): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!isNotEmpty(values.customer)) {
    errors.customer = 'Müşteri adı boş olamaz';
  }
  
  if (!isValidEmail(values.email)) {
    errors.email = 'Geçerli bir e-posta adresi giriniz';
  }
  
  if (!isValidPhoneNumber(values.phone)) {
    errors.phone = 'Geçerli bir telefon numarası giriniz';
  }
  
  if (!isValidDateFormat(values.pickup_date)) {
    errors.pickup_date = 'Geçerli bir tarih formatı giriniz (GG.AA.YYYY)';
  }
  
  if (!isValidTimeFormat(values.pickup_time)) {
    errors.pickup_time = 'Geçerli bir saat formatı giriniz (SS:DD)';
  }
  
  if (!isNotEmpty(values.pickup_location)) {
    errors.pickup_location = 'Alış noktası boş olamaz';
  }
  
  if (!isNotEmpty(values.dropoff_location)) {
    errors.dropoff_location = 'Bırakış noktası boş olamaz';
  }
  
  if (!isNotEmpty(values.car)) {
    errors.car = 'Araç seçimi boş olamaz';
  }
  
  if (!isPositiveNumber(values.passengers.toString())) {
    errors.passengers = 'Yolcu sayısı pozitif bir sayı olmalıdır';
  }
  
  if (!isPositiveNumber(values.amount.toString())) {
    errors.amount = 'Tutar pozitif bir sayı olmalıdır';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Giriş formu doğrulama
export const validateLoginForm = (values: any): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!isValidEmail(values.email)) {
    errors.email = 'Geçerli bir e-posta adresi giriniz';
  }
  
  if (!hasMinLength(values.password, 6)) {
    errors.password = 'Şifre en az 6 karakter olmalıdır';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 