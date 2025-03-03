// Test script for cars API
const fetch = require('node-fetch');

async function testCreateCar() {
  try {
    const carData = {
      name: "Mercedes Vito",
      category: "VIP",
      description: "Lüks ve konforlu bir yolculuk için ideal VIP minibüs",
      year: 2023,
      seats: 8,
      fuel_type: "Dizel",
      images: [
        "https://images.unsplash.com/photo-1551446591-142875a901a1?q=80&w=1000",
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000"
      ],
      features: [
        "Klima",
        "Deri Koltuk",
        "WiFi",
        "Minibar",
        "Bagaj Alanı"
      ],
      price_per_day: 1200
    };

    console.log('Sending car data to API:', JSON.stringify(carData, null, 2));

    const response = await fetch('https://antalyamvip.vercel.app/api/cars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API error: ${result.error || 'Unknown error'}`);
    }

    console.log('Car created successfully:', result);
  } catch (error) {
    console.error('Error creating car:', error);
  }
}

// Run the test
testCreateCar(); 