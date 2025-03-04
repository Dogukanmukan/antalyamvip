// Admin kullanıcıları için veritabanı işlemleri
import { supabase } from '../supabase.js';
import bcrypt from 'bcryptjs';

/**
 * E-posta ile admin kullanıcısını bulur
 * @param {string} email - Kullanıcı e-postası
 * @returns {Promise<Object|null>} - Kullanıcı verisi veya null
 */
export async function findAdminByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Admin kullanıcısı arama hatası:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Admin kullanıcısı arama işlemi başarısız:', error);
    return null;
  }
}

/**
 * Şifre doğrulama
 * @param {string} password - Kullanıcının girdiği şifre
 * @param {string} hashedPassword - Veritabanındaki hash'lenmiş şifre
 * @returns {Promise<boolean>} - Şifre doğru ise true, değilse false
 */
export async function verifyPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Şifre doğrulama hatası:', error);
    return false;
  }
}

/**
 * Yeni admin kullanıcısı oluşturma
 * @param {Object} userData - Kullanıcı verileri
 * @returns {Promise<Object|null>} - Oluşturulan kullanıcı veya null
 */
export async function createAdminUser(userData) {
  try {
    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Kullanıcıyı oluştur
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          email: userData.email,
          password_hash: hashedPassword,
          username: userData.username || userData.email.split('@')[0],
          role: userData.role || 'admin'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Admin kullanıcısı oluşturma hatası:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Admin kullanıcısı oluşturma işlemi başarısız:', error);
    return null;
  }
}

/**
 * Tüm admin kullanıcılarını getir
 * @returns {Promise<Array|null>} - Kullanıcı listesi veya null
 */
export async function getAllAdminUsers() {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, username, role, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Admin kullanıcılarını getirme hatası:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Admin kullanıcılarını getirme işlemi başarısız:', error);
    return null;
  }
} 