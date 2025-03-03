import express, { Request, Response } from 'express';
import cors from 'cors';
import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Veritabanı bağlantısı
const pool = createPool({
  connectionString: process.env.POSTGRES_URL || 'postgres://default:password@localhost:5432/verceldb'
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Veritabanı tabloları oluştur
app.post('/api/init-db', async (req: Request, res: Response) => {
  try {
    // Users tablosu
    await pool.sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Cars tablosu
    await pool.sql`
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
    `;

    // Bookings tablosu
    await pool.sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        pickup_location VARCHAR(255) NOT NULL,
        dropoff_location VARCHAR(255) NOT NULL,
        pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
        dropoff_date TIMESTAMP WITH TIME ZONE NOT NULL,
        passengers INTEGER NOT NULL,
        car_id INTEGER REFERENCES cars(id),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    res.status(200).json({ success: true, message: 'Veritabanı başarıyla başlatıldı' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ success: false, message: 'Veritabanı başlatılırken bir hata oluştu' });
  }
});

// Admin kullanıcısı oluştur
app.post('/api/create-admin', async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kullanıcı adı, şifre ve e-posta gerekli' 
      });
    }
    
    // Kullanıcının var olup olmadığını kontrol et
    const existingUser = await pool.sql`
      SELECT * FROM users WHERE username = ${username} OR email = ${email};
    `;
    
    if (existingUser.rows.length > 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'Admin kullanıcısı zaten mevcut',
        user: {
          id: existingUser.rows[0].id,
          username: existingUser.rows[0].username,
          email: existingUser.rows[0].email
        }
      });
    }
    
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Kullanıcıyı veritabanına ekle
    const result = await pool.sql`
      INSERT INTO users (username, password, email)
      VALUES (${username}, ${hashedPassword}, ${email})
      RETURNING id, username, email;
    `;
    
    res.status(201).json({ 
      success: true, 
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Admin kullanıcısı oluşturulurken bir hata oluştu' 
    });
  }
});

// Kullanıcı girişi
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // Kullanıcıyı bul
    const result = await pool.sql`
      SELECT * FROM users WHERE username = ${username};
    `;
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Geçersiz kullanıcı adı veya şifre' 
      });
    }
    
    const user = result.rows[0];
    
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

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
