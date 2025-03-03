const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Supabase istemcisini oluştur
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Dosya yükleme ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

// Sadece resim dosyalarını kabul et
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB maksimum dosya boyutu
  }
});

// Resim yükleme endpoint'i
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Lütfen bir resim dosyası yükleyin.' });
    }
    
    // Dosya yolunu URL olarak döndür
    const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    
    return res.status(200).json({ 
      url: fileUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    return res.status(500).json({ error: 'Resim yüklenirken bir hata oluştu.' });
  }
});

// Çoklu resim yükleme endpoint'i
app.post('/api/upload-multiple', upload.array('images', 10), (req, res) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Lütfen en az bir resim dosyası yükleyin.' });
    }
    
    // Dosya yollarını URL olarak döndür
    const fileUrls = files.map(file => ({
      url: `http://localhost:${port}/uploads/${file.filename}`,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size
    }));
    
    return res.status(200).json({ files: fileUrls });
  } catch (error) {
    console.error('Çoklu resim yükleme hatası:', error);
    return res.status(500).json({ error: 'Resimler yüklenirken bir hata oluştu.' });
  }
});

// Veritabanı tabloları oluştur
app.post('/api/init-db', async (req, res) => {
  try {
    // Supabase'in JavaScript istemcisi ile doğrudan tablo oluşturmak yerine
    // Tabloları manuel olarak oluşturmak için Supabase SQL editörünü kullanın
    // sql/init.sql dosyasındaki sorguları Supabase SQL editöründe çalıştırın
    
    // Tabloların varlığını kontrol et
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const { data: carsData, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .limit(1);
    
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
    
    // Tablo durumlarını kontrol et
    const tablesStatus = {
      users: usersError ? false : true,
      cars: carsError ? false : true,
      bookings: bookingsError ? false : true
    };
    
    if (!tablesStatus.users || !tablesStatus.cars || !tablesStatus.bookings) {
      return res.status(200).json({ 
        success: false, 
        message: 'Bazı tablolar eksik. Lütfen Supabase SQL editöründe sql/init.sql dosyasındaki sorguları çalıştırın.',
        tablesStatus
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Tüm tablolar mevcut. Veritabanı başarıyla başlatıldı.',
      tablesStatus
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ success: false, message: 'Veritabanı başlatılırken bir hata oluştu' });
  }
});

// Admin kullanıcısı oluştur
app.post('/api/create-admin', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kullanıcı adı, şifre ve e-posta gerekli' 
      });
    }
    
    // Kullanıcının var olup olmadığını kontrol et
    const { data: existingUsers, error: queryError } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${email}`);
    
    if (queryError) {
      // Tablo henüz oluşturulmamış olabilir, bu durumu kontrol edelim
      if (queryError.code === '42P01') { // relation does not exist
        // Tablo yok, sorun değil devam edebiliriz
      } else {
        throw queryError;
      }
    }
    
    if (existingUsers && existingUsers.length > 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'Admin kullanıcısı zaten mevcut',
        user: {
          id: existingUsers[0].id,
          username: existingUsers[0].username,
          email: existingUsers[0].email
        }
      });
    }
    
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Kullanıcıyı veritabanına ekle
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        { username, password: hashedPassword, email }
      ])
      .select();
    
    if (insertError) {
      throw insertError;
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Admin kullanıcısı oluşturulurken bir hata oluştu' 
    });
  }
});

// Örnek araçları veritabanına ekle
app.post('/api/seed-cars', async (req, res) => {
  try {
    // Önce mevcut araçları kontrol et
    const { data: existingCars, error: checkError } = await supabase
      .from('cars')
      .select('id')
      .limit(1);
    
    if (!checkError && existingCars.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veritabanında zaten araçlar bulunuyor. Tekrar eklemek için önce mevcut araçları silin.' 
      });
    }
    
    // Örnek araç verileri
    const carsData = [
      {
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
        fuel_type: 'Diesel',
        seats: 7,
        features: ['Leather Interior', 'Premium Sound', 'Executive Seating', 'Ambient Lighting'],
        price_per_day: 450
      },
      {
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
        fuel_type: 'Diesel',
        seats: 8,
        features: ['Chauffeur Option', 'Conference Seating', 'Wi-Fi', 'Refrigerator'],
        price_per_day: 500
      },
      {
        name: 'Vip Mercedes S-Class',
        category: 'Vip Mercedes S-Class',
        image: '/images/cars/sclass.jpg',
        images: [
          '/images/cars/sclass.jpg',
        ],
        year: 2023,
        fuel_type: 'Diesel',
        seats: 4,
        features: ['Reclining Seats', 'Panoramic Roof', 'Premium Entertainment', 'Massage Seats'],
        price_per_day: 600
      },
      {
        name: 'Vip Mercedes Sprinter',
        category: 'Vip Mercedes Sprinter',
        image: '/images/cars/sprinter-edit-0001.png',
        images: [
          '/images/cars/sprinter-edit-0001.png',
        ],
        year: 2023,
        fuel_type: 'Diesel',
        seats: 12,
        features: ['MBUX System', 'Ambient Lighting', 'Conference Setup', 'Extended Legroom'],
        price_per_day: 650
      }
    ];
    
    // Araçları veritabanına ekle
    const { data, error } = await supabase
      .from('cars')
      .insert(carsData);
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: 'Örnek araçlar başarıyla eklendi.', 
      count: carsData.length 
    });
  } catch (error) {
    console.error('Error seeding cars:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Araçlar eklenirken bir hata oluştu.', 
      error: error.message 
    });
  }
});

// Tüm araçları getiren endpoint
app.get('/api/cars', async (req, res) => {
  try {
    console.log('Araçlar için GET isteği alındı');
    
    const { data, error } = await supabase
      .from('cars')
      .select('*');
    
    if (error) {
      console.error('Araçları getirme hatası:', error);
      return res.status(500).json({ error: error.message });
    }
    
    // Araçları frontend'in beklediği formata dönüştür
    const formattedCars = data.map(car => ({
      id: car.id,
      name: car.name,
      category: car.category,
      image: car.image_url || '/images/cars/default.jpg',
      images: car.images || [car.image_url || '/images/cars/default.jpg'],
      year: car.year,
      fuelType: car.fuel_type,
      seats: car.seats,
      features: car.features || [],
      pricePerDay: car.price_per_day
    }));
    
    console.log(`${formattedCars.length} araç başarıyla getirildi`);
    return res.status(200).json(formattedCars);
  } catch (error) {
    console.error('Araçları getirme sırasında hata:', error);
    return res.status(500).json({ error: 'Araçlar getirilirken bir hata oluştu' });
  }
});

// Belirli bir aracı getir
app.get('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Araç bulunamadı.' 
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Araç getirilirken bir hata oluştu.', 
      error: error.message 
    });
  }
});

// Araç sil
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: 'Araç başarıyla silindi.' 
    });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Araç silinirken bir hata oluştu.', 
      error: error.message 
    });
  }
});

// Yeni araç ekle
app.post('/api/cars', async (req, res) => {
  try {
    const carData = req.body;
    
    const { data, error } = await supabase
      .from('cars')
      .insert([carData])
      .select();
    
    if (error) throw error;
    
    res.status(201).json({ 
      success: true, 
      message: 'Araç başarıyla eklendi.', 
      car: data[0] 
    });
  } catch (error) {
    console.error('Error adding car:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Araç eklenirken bir hata oluştu.', 
      error: error.message 
    });
  }
});

// Araç güncelle
app.put('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const carData = req.body;
    
    const { data, error } = await supabase
      .from('cars')
      .update(carData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: 'Araç başarıyla güncellendi.', 
      car: data[0] 
    });
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Araç güncellenirken bir hata oluştu.', 
      error: error.message 
    });
  }
});

// Kullanıcı girişi
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Kullanıcıyı bul
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .limit(1);
    
    if (queryError) {
      throw queryError;
    }
    
    if (!users || users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Geçersiz kullanıcı adı veya şifre' 
      });
    }
    
    const user = users[0];
    
    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Geçersiz kullanıcı adı veya şifre' 
      });
    }
    
    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Giriş sırasında bir hata oluştu' 
    });
  }
});

// Rezervasyon oluşturma endpoint'i
app.post('/api/bookings', async (req, res) => {
  try {
    console.log('Rezervasyon isteği alındı:', req.body);
    
    const {
      tripType,
      // Gidiş yolculuğu
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      // Dönüş yolculuğu
      returnPickupLocation,
      returnDropoffLocation,
      returnDate,
      returnTime,
      // Diğer bilgiler
      passengers,
      selectedCar,
      contactInfo
    } = req.body;

    console.log('Ayrıştırılan değerler:', {
      tripType,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      returnPickupLocation,
      returnDropoffLocation,
      returnDate,
      returnTime,
      passengers,
      selectedCar,
      contactInfo
    });

    // Araç ID'sini doğru şekilde al
    const carId = selectedCar?.id || null;
    console.log('Araç ID:', carId);
    
    // Araç ID'si varsa, veritabanında var mı kontrol et
    if (carId) {
      const { data: carCheck, error: carCheckError } = await supabase
        .from('cars')
        .select('id')
        .eq('id', carId)
        .single();
        
      console.log('Araç kontrolü:', { carCheck, carCheckError });
      
      if (carCheckError || !carCheck) {
        return res.status(400).json({
          success: false,
          message: `Seçilen araç (ID: ${carId}) veritabanında bulunamadı`
        });
      }
    }

    // Tarih değerlerini kontrol et
    console.log('Tarih değerleri:', {
      pickupDate,
      pickupTime,
      returnDate,
      returnTime
    });

    // Tarih ve saat bilgilerini birleştir
    let pickupDateTime, returnDateTime;
    
    try {
      // Gidiş tarihi kontrolü
      if (!pickupDate || !pickupTime) {
        throw new Error('Gidiş tarihi ve saati gereklidir');
      }
      
      pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
      console.log('Oluşturulan pickupDateTime:', pickupDateTime);
      
      // Geçerli tarih mi kontrol et
      if (isNaN(pickupDateTime.getTime())) {
        throw new Error(`Geçersiz pickup tarihi: ${pickupDate}T${pickupTime}`);
      }
      
      // Eğer gidiş-dönüş ise, dönüş tarihini de kontrol et
      if (tripType === 'roundTrip') {
        if (!returnDate || !returnTime) {
          throw new Error('Gidiş-dönüş seyahati için dönüş tarihi ve saati gereklidir');
        }
        
        returnDateTime = new Date(`${returnDate}T${returnTime}`);
        console.log('Oluşturulan returnDateTime:', returnDateTime);
        
        if (isNaN(returnDateTime.getTime())) {
          throw new Error(`Geçersiz return tarihi: ${returnDate}T${returnTime}`);
        }
      }
    } catch (dateError) {
      console.error('Tarih dönüştürme hatası:', dateError);
      return res.status(400).json({
        success: false,
        message: 'Geçersiz tarih formatı: ' + dateError.message
      });
    }

    // Veritabanına kaydedilecek veriyi hazırla
    const bookingData = {
      trip_type: tripType || 'oneWay',
      // Gidiş yolculuğu
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      pickup_date: pickupDateTime.toISOString(),
      // Dönüş yolculuğu (varsa)
      return_pickup_location: tripType === 'roundTrip' ? returnPickupLocation : null,
      return_dropoff_location: tripType === 'roundTrip' ? returnDropoffLocation : null,
      return_date: tripType === 'roundTrip' && returnDateTime ? returnDateTime.toISOString() : null,
      // Diğer bilgiler
      passengers: passengers,
      car_id: carId,
      full_name: contactInfo.fullName,
      email: contactInfo.email,
      phone: contactInfo.phone,
      notes: contactInfo.notes || null,
      status: 'pending'
    };

    console.log('Supabase\'e gönderilecek veri:', bookingData);

    // Rezervasyonu veritabanına kaydet
    const result = await supabase
      .from('bookings')
      .insert(bookingData)
      .select('id');
      
    console.log('Supabase yanıtı:', result);

    if (result.error) {
      console.error('Supabase hatası:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Veritabanı hatası: ' + result.error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Rezervasyon başarıyla oluşturuldu',
      bookingId: result.data[0].id
    });
  } catch (error) {
    console.error('Rezervasyon oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rezervasyon oluşturulurken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata')
    });
  }
});

// Rezervasyonları getirme endpoint'i
app.get('/api/bookings', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = supabase
      .from('bookings')
      .select('*, cars(*)');
    
    // Tarih filtreleme
    if (startDate && endDate) {
      query = query.gte('pickup_date', startDate).lte('pickup_date', endDate);
    } else if (startDate) {
      query = query.gte('pickup_date', startDate);
    } else if (endDate) {
      query = query.lte('pickup_date', endDate);
    }
    
    // Varsayılan olarak en yeni rezervasyonlar en üstte
    const result = await query.order('created_at', { ascending: false });

    res.status(200).json({
      success: true,
      bookings: result.data
    });
  } catch (error) {
    console.error('Rezervasyonları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rezervasyonlar getirilirken bir hata oluştu'
    });
  }
});

// Rezervasyon durumunu güncelleme endpoint'i
app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz rezervasyon durumu'
      });
    }

    await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    res.status(200).json({
      success: true,
      message: 'Rezervasyon durumu güncellendi'
    });
  } catch (error) {
    console.error('Rezervasyon durumu güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rezervasyon durumu güncellenirken bir hata oluştu'
    });
  }
});

// Dashboard verileri için endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    console.log('Dashboard verileri için istek alındı');
    
    // Toplam rezervasyon sayısı
    const { count: totalBookings, error: totalBookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });
    
    if (totalBookingsError) {
      console.error('Toplam rezervasyon sayısı alınırken hata:', totalBookingsError);
      throw totalBookingsError;
    }
    
    // Bu ayki rezervasyon sayısı
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
    
    const { count: monthlyBookings, error: monthlyBookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('pickup_datetime', firstDayOfMonth)
      .lte('pickup_datetime', lastDayOfMonth);
    
    if (monthlyBookingsError) {
      console.error('Aylık rezervasyon sayısı alınırken hata:', monthlyBookingsError);
      throw monthlyBookingsError;
    }
    
    // Bekleyen rezervasyon sayısı
    const { count: pendingBookings, error: pendingBookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (pendingBookingsError) {
      console.error('Bekleyen rezervasyon sayısı alınırken hata:', pendingBookingsError);
      throw pendingBookingsError;
    }
    
    // Toplam araç sayısı
    const { count: totalCars, error: totalCarsError } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true });
    
    if (totalCarsError) {
      console.error('Toplam araç sayısı alınırken hata:', totalCarsError);
      throw totalCarsError;
    }
    
    // Son 5 rezervasyon
    const { data: recentBookings, error: recentBookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        pickup_datetime,
        status,
        contact_info,
        car_id,
        cars (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentBookingsError) {
      console.error('Son rezervasyonlar alınırken hata:', recentBookingsError);
      throw recentBookingsError;
    }
    
    // Rezervasyonları frontend için formatlayalım
    const formattedBookings = recentBookings.map(booking => {
      const contactInfo = booking.contact_info || {};
      return {
        id: booking.id,
        name: contactInfo.fullName || 'İsimsiz Müşteri',
        date: new Date(booking.pickup_datetime).toLocaleDateString('tr-TR'),
        car: booking.cars?.name || 'Bilinmeyen Araç',
        status: booking.status || 'pending'
      };
    });
    
    // Tüm verileri bir araya getirip gönderelim
    const dashboardData = {
      stats: {
        totalBookings: totalBookings || 0,
        monthlyBookings: monthlyBookings || 0,
        pendingBookings: pendingBookings || 0,
        totalCars: totalCars || 0
      },
      recentBookings: formattedBookings
    };
    
    console.log('Dashboard verileri başarıyla gönderildi');
    return res.status(200).json(dashboardData);
    
  } catch (error) {
    console.error('Dashboard verileri alınırken hata:', error);
    return res.status(500).json({ error: 'Dashboard verileri alınırken bir hata oluştu' });
  }
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
