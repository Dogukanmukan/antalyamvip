import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Upload, Trash2 } from 'lucide-react';
import api from '../utils/api-compat';
import { supabase } from '../utils/supabase';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface CarFormProps {
  initialData?: any;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CarForm: React.FC<CarFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    make: initialData?.make || '',
    model: initialData?.model || '',
    category: initialData?.category || 'Sedan',
    passengers: initialData?.seats || 4,
    luggage: initialData?.luggage || 3,
    price: initialData?.price_per_day || '',
    status: initialData?.status || 'active',
    description: initialData?.description || '',
    features: initialData?.features || [''],
    images: initialData?.images || []
  });
  
  // Hata state'i
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Yükleme durumu
  const [isUploading, setIsUploading] = useState(false);
  
  // Görsel önizleme
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  // Supabase client
  const supabase = useSupabaseClient();
  
  // Component mount olduğunda önizleme görsellerini ayarla
  useEffect(() => {
    if (initialData?.images && Array.isArray(initialData.images) && initialData.images.length > 0) {
      setPreviewImages(initialData.images);
    }
  }, [initialData]);
  
  // Input değişikliklerini işle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Sayısal input değişikliklerini işle
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Sadece sayısal değerlere izin ver
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Hata varsa temizle
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };
  
  // Özellik ekle
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };
  
  // Özellik güncelle
  const updateFeature = (index: number, value: string) => {
    setFormData(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[index] = value;
      return {
        ...prev,
        features: updatedFeatures
      };
    });
  };
  
  // Özellik kaldır
  const removeFeature = (index: number) => {
    setFormData(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures.splice(index, 1);
      return {
        ...prev,
        features: updatedFeatures
      };
    });
  };
  
  // Çoklu görsel yükleme
  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    // Dosya sayısı kontrolü (maksimum 10 resim)
    if (files.length > 10) {
      setErrors(prev => ({
        ...prev,
        images: 'En fazla 10 resim yükleyebilirsiniz.'
      }));
      return;
    }
    
    // Dosya boyutu ve tip kontrolü
    const invalidFiles = Array.from(files).filter(file => {
      // Boyut kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) return true;
      
      // Tip kontrolü
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return true;
      
      return false;
    });
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: 'Bazı dosyalar geçersiz. Sadece 5MB\'dan küçük JPEG, PNG ve WEBP formatları desteklenmektedir.'
      }));
      return;
    }
    
    // Önizleme için URL'ler oluştur
    const previews: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setPreviewImages(previews); // Önceki önizlemeleri temizle, sadece yeni yüklenen görselleri göster
        }
      };
      reader.readAsDataURL(file);
    });
    
    try {
      console.log('Görsel yükleme başlatılıyor:', Array.from(files).map(f => f.name).join(', '));
      setIsUploading(true);
      
      // Kullanıcının oturum açtığını kontrol et
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('Oturum açılmamış, görseller yüklenemez');
        
        // Supabase oturumunu kontrol et
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData && sessionData.session) {
            console.log('Supabase oturumu bulundu, token yenileniyor');
            localStorage.setItem('adminToken', sessionData.session.access_token);
            
            // Yeni token ile devam et
            const results = await api.files.uploadMultipleFiles(Array.from(files), 'car-images');
            console.log('Dosyalar başarıyla yüklendi:', results);
            
            // Görselleri form verisine ekle
            if (results.length > 0) {
              setFormData(prev => ({
                ...prev,
                images: results.map(r => r.url) // Önceki görselleri silip sadece yeni yüklenen görselleri ekle
              }));
            }
            
            if (errors.images) {
              setErrors(prev => ({ ...prev, images: '' }));
            }
            
            setIsUploading(false);
            return;
          }
        } catch (sessionError) {
          console.error('Supabase oturum kontrolü hatası:', sessionError);
        }
        
        setErrors(prev => ({
          ...prev,
          images: 'Oturum açılmamış. Lütfen tekrar giriş yapın.'
        }));
        
        // Kullanıcıyı login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
        
        setIsUploading(false);
        return;
      }
      
      // Dosyaları yükle
      const results = await api.files.uploadMultipleFiles(Array.from(files), 'car-images');
      
      console.log('Dosyalar başarıyla yüklendi:', results);
      
      // Görselleri form verisine ekle
      if (results.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: results.map(r => r.url) // Önceki görselleri silip sadece yeni yüklenen görselleri ekle
        }));
      }
      
      // Hata varsa temizle
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: '' }));
      }
    } catch (error: any) {
      console.error('Görsel yükleme hatası:', error);
      setErrors(prev => ({
        ...prev,
        images: error.message || 'Görseller yüklenirken bir hata oluştu.'
      }));
    } finally {
      setIsUploading(false);
    }
  };
  
  // Görsel kaldır
  const removeImage = (index: number) => {
    setFormData(prev => {
      const updatedImages = [...prev.images];
      updatedImages.splice(index, 1);
      return {
        ...prev,
        images: updatedImages
      };
    });
    
    setPreviewImages(prev => {
      const updatedPreviews = [...prev];
      updatedPreviews.splice(index, 1);
      return updatedPreviews;
    });
  };
  
  // Form doğrulama
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Araç adı zorunludur.';
    }
    
    if (!formData.make.trim()) {
      newErrors.make = 'Marka zorunludur.';
    }
    
    if (!formData.model.trim()) {
      newErrors.model = 'Model zorunludur.';
    }
    
    setErrors(newErrors);
    
    // Hata yoksa true döndür
    return Object.keys(newErrors).length === 0;
  };
  
  // Formu gönder
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Boş özellikleri filtrele
      const filteredFeatures = formData.features.filter(f => f.trim() !== '');
      
      // Images alanını kontrol et
      let processedImages = formData.images;
      
      // Null değerleri temizle
      if (Array.isArray(processedImages)) {
        processedImages = processedImages.filter(img => img !== null && img !== 'null' && img !== '');
      } else {
        processedImages = [];
      }
      
      // API'ye uygun formatta veriyi hazırla
      const apiFormData = {
        name: formData.name,
        make: formData.make,
        model: formData.model,
        category: formData.category,
        seats: formData.passengers,
        luggage: formData.luggage,
        price_per_day: formData.price,
        status: formData.status,
        description: formData.description,
        features: filteredFeatures,
        images: processedImages
      };
      
      console.log('Gönderilen form verisi:', apiFormData);
      console.log('images tipi:', typeof apiFormData.images, 'değeri:', apiFormData.images);
      
      // Formu gönder
      onSubmit(apiFormData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Temel Bilgiler */}
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Temel Bilgiler</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Araç Adı */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Araç Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Araç adını girin"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          
          {/* Kategori */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Minivan">Minivan</option>
              <option value="Luxury">Lüks</option>
              <option value="Sports">Spor</option>
            </select>
          </div>
          
          {/* Marka */}
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Marka <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="make"
              name="make"
              value={formData.make}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Markayı girin"
            />
            {errors.make && <p className="mt-1 text-sm text-red-500">{errors.make}</p>}
          </div>
          
          {/* Model */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Modeli girin"
            />
            {errors.model && <p className="mt-1 text-sm text-red-500">{errors.model}</p>}
          </div>
          
          {/* Yolcu Kapasitesi */}
          <div>
            <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Yolcu Kapasitesi
            </label>
            <input
              type="number"
              id="passengers"
              name="passengers"
              value={formData.passengers}
              onChange={handleNumberChange}
              min="1"
              max="20"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Yolcu kapasitesini girin"
            />
          </div>
          
          {/* Bagaj Kapasitesi */}
          <div>
            <label htmlFor="luggage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bagaj Kapasitesi
            </label>
            <input
              type="number"
              id="luggage"
              name="luggage"
              value={formData.luggage}
              onChange={handleNumberChange}
              min="0"
              max="10"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Bagaj kapasitesini girin"
            />
          </div>
          
          {/* Fiyat */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Günlük Fiyat (₺)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleNumberChange}
              min="0"
              step="1"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Günlük fiyatı girin"
            />
          </div>
          
          {/* Durum */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durum
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="active">Aktif</option>
              <option value="maintenance">Bakımda</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Açıklama */}
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Açıklama</h3>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Araç Açıklaması
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Araç hakkında detaylı bilgi girin"
          ></textarea>
        </div>
      </div>
      
      {/* Özellikler */}
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium dark:text-white">Özellikler</h3>
          <button
            type="button"
            onClick={addFeature}
            className="px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Özellik Ekle
          </button>
        </div>
        
        <div className="space-y-3">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Özellik girin (örn. Bluetooth, Klima)"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
                disabled={formData.features.length === 1}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Görseller */}
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Araç Görselleri</h3>
        
        <div className="space-y-4">
          {/* Görsel Yükleme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Görseller (Maksimum 10 adet)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="images"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500 dark:bg-gray-700 dark:text-amber-400 dark:hover:text-amber-300"
                  >
                    <span>Görsel Yükle</span>
                    <input
                      id="images"
                      name="images"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleImagesChange}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="pl-1">veya sürükle bırak</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, WEBP (Maks. 5MB)
                </p>
              </div>
            </div>
            {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
            {isUploading && <p className="mt-2 text-sm text-amber-500">Görseller yükleniyor...</p>}
          </div>
          
          {/* Görsel Önizleme */}
          {previewImages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Yüklenen Görseller</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 px-2 py-1 bg-amber-500 text-white text-xs rounded-md">
                        Ana Görsel
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                İlk görsel ana görsel olarak kullanılacaktır.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Form Butonları */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          disabled={isSubmitting}
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-amber-600 border border-transparent rounded-md text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
};

export default CarForm; 