import { Car } from '../types';

export const cars: Car[] = [
  {
    id: 1,
    name: 'Eko Vip',
    category: 'Eko Vip',
    image: '/images/cars/vitodıs1.jpeg',
    images: [
      '/images/cars/transporterlogo.jpg',
      '/images/cars/transporterdıs.jpeg',
      '/images/cars/transporterdıs2.jpeg',
      '/images/cars/interiorvip.jpeg',
      '/images/cars/interiorvip2.jpeg'
    ],
    year: 2023,
    fuelType: 'Diesel',
    seats: 7,
    features: ['Leather Interior', 'Premium Sound', 'Executive Seating', 'Ambient Lighting'],
    pricePerDay: 450
  },
  {
    id: 2,
    name: 'Ultra Vip',
    category: 'Ultra Vip',
    image: '/images/cars/vitodıs2.jpeg',
    images: [
      '/images/cars/vito1.webp',
      '/images/cars/vitodıs1.jpeg',
      '/images/cars/vitodıs2.jpeg',
      '/images/cars/mercedes_vito_maybach.png',
      '/images/cars/interiorvip2.jpeg',
      '/images/cars/interiorvip.jpeg',
      '/images/cars/interiorvip4.jpeg'
    ],
    year: 2023,
    fuelType: 'Diesel',
    seats: 8,
    features: ['Chauffeur Option', 'Conference Seating', 'Wi-Fi', 'Refrigerator'],
    pricePerDay: 500
  },
  {
    id: 3,
    name: 'Vip Mercedes S-Class',
    category: 'Vip Mercedes S-Class',
    image: '/images/cars/sclass.jpg',
    images: [
      '/images/cars/sclass.jpg',
    ],
    year: 2023,
    fuelType: 'Diesel',
    seats: 4,
    features: ['Reclining Seats', 'Panoramic Roof', 'Premium Entertainment', 'Massage Seats'],
    pricePerDay: 600
  },
  {
    id: 4,
    name: 'Vip Mercedes Sprinter',
    category: 'Vip Mercedes Sprinter',
    image: '/images/cars/sprinter-edit-0001.png',
    images: [
      '/images/cars/sprinter-edit-0001.png',
    ],
    year: 2023,
    fuelType: 'Diesel',
    seats: 12,
    features: ['MBUX System', 'Ambient Lighting', 'Conference Setup', 'Extended Legroom'],
    pricePerDay: 650
  }
];