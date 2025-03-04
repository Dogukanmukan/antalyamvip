import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { Upload, X, Plus, Image as ImageIcon, Loader } from 'lucide-react';

// Araç tipi tanımı
interface Car {
  id?: number;
  name: string;
  category: string;
  images: string[];
  year: number;
  fuel_type: string;
  seats: number;
  features: string[];
  price_per_day: number | null;
}

const EditCar: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State tanımlamaları
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Araç verileri
  const [car, setCar] = useState<Car>({
    name: '',
    category: '',
    images: [],
    year: new Date().getFullYear(),
    fuel_type: 'Diesel',
    seats: 4,
    features: [''],
    price_per_day: null
  });
  
  // Resim yükleme state'leri
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Kimlik doğrulama ve veri yükleme
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    if (isEditMode && id) {
      fetchCar(id);
    } else {
      setIsLoading(false);
    }
  }, [id, navigate, isEditMode]);
  
  // Araç verilerini getir
  const fetchCar = async (carId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cars/${carId}`);
      
      if (!response.ok) {
        throw new Error('Araç bilgileri alınamadı');
      }
      
      const data = await response.json();
      setCar({
        ...data,
        images: Array.isArray(data.images) ? data.images : [],
        features: Array.isArray(data.features) && data.features.length > 0 
          ? data.features 
          : ['']
      });
    } catch (err) {
      console.error('Araç getirme hatası:', err);
      setError('Araç bilgileri alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Form alanı değişikliklerini işle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'year' || name === 'seats' || name === 'price_per_day') {
      setCar({
        ...car,
        [name]: value === '' ? null : Number(value)
      });
    } else {
      setCar({
        ...car,
        [name]: value
      });
    }
  };
  
  // Özellik alanı değişikliklerini işle
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...car.features];
    newFeatures[index] = value;
    setCar({
      ...car,
      features: newFeatures
    });
  };
  
  // Yeni özellik alanı ekle
  const addFeatureField = () => {
    setCar({
      ...car,
      features: [...car.features, '']
    });
  };
  
  // Özellik alanını kaldır
  const removeFeatureField = (index: number) => {
    if (car.features.length <= 1) return;
    
    const newFeatures = [...car.features];
    newFeatures.splice(index, 1);
    setCar({
      ...car,
      features: newFeatures
    });
  };
  
  // Dosya seçme işlemi
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    
    // Sadece resim dosyalarını kabul et
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      setError('Sadece resim dosyaları yüklenebilir');
      return;
    }
    
    // Dosya boyutu kontrolü (5MB)
    const validFiles = imageFiles.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length !== imageFiles.length) {
      setError('Bazı dosyalar çok büyük. Maksimum dosya boyutu 5MB');
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError(null);
    
    // Input değerini sıfırla (aynı dosyayı tekrar seçebilmek için)
    if (e.target.value) {
      e.target.value = '';
    }
  };
  
  // Seçilen dosyayı kaldır
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Mevcut resmi kaldır
  const removeExistingImage = (index: number) => {
    setCar({
      ...car,
      images: car.images.filter((_, i) => i !== index)
    });
  };
  
  // Dosya seçme dialogunu aç
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Resimleri yükle
  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    const uploadedImageUrls: string[] = [];
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Base64'e dönüştür
        const base64 = await convertToBase64(file);
        
        // Sunucuya yükle
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64,
            filename: file.name
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Resim yükleme hatası:', errorData);
          throw new Error(errorData.error || 'Resim yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        uploadedImageUrls.push(data.url);
        
        // İlerleme durumunu güncelle
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }
      
      // Yüklenen resimleri araç verilerine ekle
      setCar({
        ...car,
        images: [...car.images, ...uploadedImageUrls]
      });
      
      // Seçilen dosyaları temizle
      setSelectedFiles([]);
      setSuccess('Resimler başarıyla yüklendi');
      
      // 3 saniye sonra başarı mesajını temizle
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Resim yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Resim yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Base64'e dönüştürme yardımcı fonksiyonu
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Yüklenmemiş resimler varsa uyarı ver
    if (selectedFiles.length > 0) {
      if (!window.confirm('Yüklenmemiş resim dosyaları var. Devam etmek istiyor musunuz?')) {
        return;
      }
    }
    
    // Zorunlu alanları kontrol et
    if (!car.name.trim()) {
      setError('Araç adı zorunludur');
      return;
    }
    
    if (!car.category.trim()) {
      setError('Kategori zorunludur');
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Boş özellikleri temizle
      const cleanedFeatures = car.features.filter(feature => feature.trim() !== '');
      
      // Gönderilecek veriyi hazırla
      const carData = {
        ...car,
        features: cleanedFeatures.length > 0 ? cleanedFeatures : []
      };
      
      // API endpoint ve method
      const url = isEditMode ? `/api/cars/${id}` : '/api/cars';
      const method = isEditMode ? 'PUT' : 'POST';
      
      // API isteği
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'İşlem sırasında bir hata oluştu');
      }
      
      // Başarı mesajı göster
      setSuccess(isEditMode ? 'Araç başarıyla güncellendi' : 'Araç başarıyla eklendi');
      
      // Araç listesine yönlendir
      setTimeout(() => {
        navigate('/admin/cars');
      }, 1500);
    } catch (err) {
      console.error('Form gönderme hatası:', err);
      setError(err instanceof Error ? err.message : 'İşlem sırasında bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={isEditMode ? "Araç Düzenle" : "Yeni Araç Ekle"} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              {isEditMode ? "Araç Düzenle" : "Yeni Araç Ekle"}
            </h1>
            <button 
              onClick={() => navigate('/admin/cars')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Geri Dön
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
              <span className="mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-start">
              <span className="mr-2">✅</span>
              <span>{success}</span>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Araç Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Araç Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={car.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Örn: Mercedes C180"
                  />
                </div>
                
                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={car.category}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Örn: Sedan, SUV, Ekonomik"
                  />
                </div>
                
                {/* Yıl */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yıl
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={car.year || ''}
                    onChange={handleChange}
                    min="2000"
                    max="2030"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                {/* Yakıt Tipi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yakıt Tipi
                  </label>
                  <select
                    name="fuel_type"
                    value={car.fuel_type}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="Diesel">Dizel</option>
                    <option value="Gasoline">Benzin</option>
                    <option value="Hybrid">Hibrit</option>
                    <option value="Electric">Elektrik</option>
                  </select>
                </div>
                
                {/* Koltuk Sayısı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Koltuk Sayısı
                  </label>
                  <input
                    type="number"
                    name="seats"
                    value={car.seats || ''}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                {/* Fiyat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Günlük Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    name="price_per_day"
                    value={car.price_per_day || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
              
              {/* Özellikler */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Özellikler
                </label>
                {car.features.map((feature, index) => (
                  <div key={`feature-${index}`} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Örn: Otomatik vites, Klima, Bluetooth"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeatureField(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                      disabled={car.features.length <= 1}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeatureField}
                  className="mt-2 text-sm text-amber-600 hover:text-amber-800 flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Özellik Ekle
                </button>
              </div>
              
              {/* Resim Yükleme Alanı */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Araç Resimleri</h3>
                
                {/* Mevcut Resimler */}
                {car.images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Mevcut Resimler:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {car.images.map((image, index) => (
                        <div key={`image-${index}`} className="relative group">
                          <img 
                            src={image} 
                            alt={`Araç resmi ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Seçilen Dosyalar */}
                {selectedFiles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Yüklenecek Resimler:</h4>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={`file-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center">
                            <ImageIcon size={16} className="text-gray-500 mr-2" />
                            <span className="text-sm truncate max-w-xs">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeSelectedFile(index)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Yükleme Butonu */}
                    <div className="mt-3 flex space-x-2">
                      <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center disabled:bg-blue-300"
                        onClick={uploadImages}
                        disabled={isUploading || selectedFiles.length === 0}
                      >
                        {isUploading ? (
                          <>
                            <Loader size={16} className="mr-2 animate-spin" />
                            Yükleniyor... {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Upload size={16} className="mr-2" />
                            Resimleri Yükle
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm"
                        onClick={() => setSelectedFiles([])}
                        disabled={isUploading || selectedFiles.length === 0}
                      >
                        Temizle
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Dosya Seçme Alanı */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={openFileDialog}
                    disabled={isUploading}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Plus size={24} className="text-gray-400 mb-2" />
                    <span className="text-gray-500 font-medium">Resim Ekle</span>
                    <span className="text-gray-400 text-sm mt-1">veya sürükleyip bırakın</span>
                    <span className="text-gray-400 text-xs mt-1">PNG, JPG, GIF (max. 5MB)</span>
                  </button>
                </div>
              </div>
              
              {/* Gönder Butonu */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md disabled:opacity-50 flex items-center"
                >
                  {isSaving && <Loader size={16} className="mr-2 animate-spin" />}
                  {isSaving ? 'Kaydediliyor...' : (isEditMode ? 'Güncelle' : 'Ekle')}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default EditCar;
