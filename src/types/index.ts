export interface Car {
  id: number;
  name: string;
  category: string;
  image: string; // Ana resim (geriye dönük uyumluluk için)
  images: string[]; // Birden fazla resim için dizi
  year: number;
  fuelType: string;
  seats: number;
  features: string[];
  pricePerDay?: number; // Opsiyonel, müşteriye gösterilmeyecek
}