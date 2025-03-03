import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { Upload, X, Plus, Image as ImageIcon, AlertCircle } from 'lucide-react';

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
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kimlik doğrulama kontrolü
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
      if (isEditMode) {
        fetchCar();
      } else {
        setLoading(false);
      }
    }
  }, [navigate, id]);

  // Araç verilerini getir
  const fetchCar = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/cars/${id}`);
      
      if (!response.ok) {
        throw new Error('Araç bilgileri alınamadı');
      }
      
      const data = await response.json();
      setCar(data);
      // Mevcut resimleri images state'ine ekle
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching car:', error);
      setError('Araç bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  // Resim yükleme işlemi
  const handleImageUpload = async () => {
    if (imageFiles.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    try {
      // Base64 formatına dönüştürme işlemi
      const uploadPromises = imageFiles.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              image: e.target?.result,
              filename: file.name
            });
          };
          reader.onerror = (e) => {
            reject(e);
          };
          reader.readAsDataURL(file);
        });
      });
      
      const base64Files = await Promise.all(uploadPromises);
      
      // Her bir resmi ayrı ayrı yükle
      const uploadResults = await Promise.all(
        base64Files.map(async (fileData: any) => {
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fileData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Resim yüklenirken bir hata oluştu');
          }
          
          return await response.json();
        })
      );
      
      // Yeni resimleri ekle
      const newImageUrls = uploadResults.map((result) => result.url);
      setImages(prev => [...prev, ...newImageUrls]);
      
      // Yüklenen dosyaları temizle
      setImageFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // setSuccess('Resimler başarıyla yüklendi');
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Resim yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  // Resim dosyalarını seç
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Sadece resim dosyalarını kabul et
      const imageFilesOnly = filesArray.filter(file => file.type.startsWith('image/'));
      
      if (imageFilesOnly.length !== filesArray.length) {
        setUploadError('Sadece resim dosyaları yüklenebilir');
      } else {
        setImageFiles(prev => [...prev, ...imageFilesOnly]);
        setUploadError(null);
      }
    }
  };

  // Seçilen resim dosyasını kaldır
  const removeSelectedFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Yüklenen resmi kaldır
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Dosya seçme dialogunu aç
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Araç verilerini hazırla
      const carData = {
        ...car,
        // Sadece yüklenen resimleri kullan
        images: images
      };
      
      // Boş alanları temizle
      if (carData.features) {
        carData.features = carData.features.filter(feature => feature.trim() !== '');
      }
      
      const url = id 
        ? `/api/cars/${id}` 
        : '/api/cars';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Bir hata oluştu');
      }
      
      // setSuccess(id ? 'Araç başarıyla güncellendi!' : 'Araç başarıyla eklendi!');
      
      // Başarılı işlemden sonra araç listesine yönlendir
      setTimeout(() => {
        navigate('/admin/cars');
      }, 1500);
      
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Input değişikliklerini yönet
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

  // Özellik dizisini yönet
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
    if (car.features.length <= 1) {
      return; // En az bir özellik alanı olmalı
    }
    
    const newFeatures = [...car.features];
    newFeatures.splice(index, 1);
    setCar({
      ...car,
      features: newFeatures
    });
  };

  if (!isAuthenticated) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={isEditMode ? "Araç Düzenle" : "Yeni Araç Ekle"} />
        
        <main className="flex-1 overflow-y-auto p-6">
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-10">
              <div className="spinner"></div>
              <p className="mt-2 text-gray-600">Yükleniyor...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Araç Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Araç Adı
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={car.name}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={car.category}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
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
                    required
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
                    required
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
                    required
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
              
              {/* Resim Yükleme Alanı */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Araç Resimleri</h3>
                
                {/* Yüklenen Resimler */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Car image ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Seçilen Dosyalar */}
                {imageFiles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Yüklenecek Dosyalar:</h4>
                    <div className="space-y-2">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
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
                    
                    <div className="mt-3 flex space-x-2">
                      <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm flex items-center disabled:bg-blue-300"
                        onClick={handleImageUpload}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <span className="spinner-sm mr-2"></span>
                            Yükleniyor...
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
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
                        onClick={() => setImageFiles([])}
                      >
                        Temizle
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Dosya Seçme Alanı */}
                <div className="mt-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={24} className="text-gray-400 mb-2" />
                    <span className="text-gray-500 font-medium">Resim Ekle</span>
                    <span className="text-gray-400 text-sm mt-1">veya sürükleyip bırakın</span>
                    <span className="text-gray-400 text-xs mt-1">PNG, JPG, GIF (max. 5MB)</span>
                  </button>
                </div>
                
                {/* Hata Mesajı */}
                {uploadError && (
                  <div className="mt-2 text-red-500 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {uploadError}
                  </div>
                )}
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
                      placeholder="Araç özelliği"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeatureField(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeatureField}
                  className="mt-2 text-sm text-amber-600 hover:text-amber-800"
                >
                  + Özellik Ekle
                </button>
              </div>
              
              {/* Gönder Butonu */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : (isEditMode ? 'Güncelle' : 'Ekle')}
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
