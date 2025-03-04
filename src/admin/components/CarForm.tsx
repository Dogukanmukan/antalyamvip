import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Upload } from 'lucide-react';
import api from '../utils/api-compat';
import { supabase } from '../utils/supabase';

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
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    category: 'Sedan',
    passengers: 4,
    luggage: 3,
    price: 0,
    status: 'active',
    description: '',
    features: [''],
    image: '',
    images: [] as string[]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form ilk yüklendiğinde veya initialData değiştiğinde formu doldur
  useEffect(() => {
    if (initialData) {
      console.log('CarForm - initialData:', {
        id: initialData.id,
        name: initialData.name,
        image: initialData.image,
        images: initialData.images,
        imagesType: initialData.images ? typeof initialData.images : 'undefined',
        imagesIsArray: initialData.images ? Array.isArray(initialData.images) : false
      });
      
      setFormData({
        name: initialData.name || '',
        make: initialData.make || '',
        model: initialData.model || '',
        category: initialData.category || 'Sedan',
        passengers: initialData.passengers || 4,
        luggage: initialData.luggage || 3,
        price: initialData.price || 0,
        status: initialData.status || 'active',
        description: initialData.description || '',
        features: initialData.features?.length ? initialData.features : [''],
        image: initialData.image || '',
        images: initialData.images || []
      });
      
      if (initialData.image) {
        setPreviewImage(initialData.image);
      }
      
      if (initialData.images) {
        setPreviewImages(initialData.images);
      }
    }
  }, [initialData]);
  
  // Form alanlarını güncelle
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
  
  // Sayısal alanları güncelle
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
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
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };
  
  // Özellik sil
  const removeFeature = (index: number) => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures.length ? updatedFeatures : ['']
    }));
  };
  
  // Resim yükleme
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Resim boyutu 5MB\'dan küçük olmalıdır.'
        }));
        return;
      }
      
      // Dosya tipini kontrol et
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: 'Sadece JPEG, PNG ve WEBP formatları desteklenmektedir.'
        }));
        return;
      }
      
      // Önizleme için URL oluştur
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      try {
        console.log('Resim yükleme başlatılıyor:', file.name);
        
        // Kullanıcının oturum açtığını kontrol et
        const token = localStorage.getItem('adminToken');
        const user = localStorage.getItem('adminUser');
        
        console.log('Oturum kontrolü:', { 
          tokenVar: !!token, 
          userVar: !!user,
          tokenLength: token ? token.length : 0
        });
        
        if (!token) {
          console.error('Oturum açılmamış, resim yüklenemez');
          
          // Supabase oturumunu kontrol et
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData && sessionData.session) {
              console.log('Supabase oturumu bulundu, token yenileniyor');
              localStorage.setItem('adminToken', sessionData.session.access_token);
              
              // Yeni token ile devam et
              const result = await api.files.uploadFile(file, 'car-images');
              console.log('Dosya yükleme başarılı:', result);
              
              setFormData(prev => ({
                ...prev,
                image: result.url
              }));
              
              if (errors.image) {
                setErrors(prev => ({ ...prev, image: '' }));
              }
              
              return;
            }
          } catch (sessionError) {
            console.error('Supabase oturum kontrolü hatası:', sessionError);
          }
          
          setErrors(prev => ({
            ...prev,
            image: 'Oturum açılmamış. Lütfen tekrar giriş yapın.'
          }));
          
          // Kullanıcıyı login sayfasına yönlendir
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);
          
          return;
        }
        
        // Dosyayı yükle
        const result = await api.files.uploadFile(file, 'car-images');
        
        console.log('Dosya yükleme başarılı:', result);
        
        // Yüklenen dosyanın URL'sini form verisine ekle
        setFormData(prev => ({
          ...prev,
          image: result.url
        }));
        
        // Hata varsa temizle
        if (errors.image) {
          setErrors(prev => ({
            ...prev,
            image: ''
          }));
        }
      } catch (error: any) {
        console.error('Dosya yükleme hatası:', error);
        
        // Hata mesajını göster
        let errorMessage = 'Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.';
        
        // Eğer 401 hatası ise oturum hatası mesajı göster
        if (error.response && error.response.status === 401) {
          errorMessage = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.';
          
          // Kullanıcıyı login sayfasına yönlendir
          setTimeout(() => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/admin/login';
          }, 2000);
        }
        
        setErrors(prev => ({
          ...prev,
          image: errorMessage
        }));
      }
    }
  };
  
  // Çoklu resim yükleme
  const handleMultipleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setPreviewImages(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    try {
      console.log('Çoklu resim yükleme başlatılıyor:', Array.from(files).map(f => f.name).join(', '));
      setIsUploading(true);
      
      // Kullanıcının oturum açtığını kontrol et
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('Oturum açılmamış, resimler yüklenemez');
        
        // Supabase oturumunu kontrol et
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData && sessionData.session) {
            console.log('Supabase oturumu bulundu, token yenileniyor');
            localStorage.setItem('adminToken', sessionData.session.access_token);
            
            // Yeni token ile devam et
            const results = await api.files.uploadMultipleFiles(Array.from(files), 'car-images');
            console.log('Dosyalar başarıyla yüklendi:', results);
            
            // Çoklu görsel yükleme durumunda, ana görsel alanını boşalt ve tüm görselleri images dizisine ekle
            if (results.length > 0) {
              setFormData(prev => ({
                ...prev,
                image: '', // Ana görsel alanını temizle
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
      
      // Çoklu görsel yükleme durumunda, ana görsel alanını boşalt ve tüm görselleri images dizisine ekle
      if (results.length > 0) {
        setFormData(prev => ({
          ...prev,
          image: '', // Ana görsel alanını temizle
          images: results.map(r => r.url) // Önceki görselleri silip sadece yeni yüklenen görselleri ekle
        }));
      }
      
      // Hata varsa temizle
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: '' }));
      }
    } catch (error: any) {
      console.error('Resim yükleme hatası:', error);
      setErrors(prev => ({
        ...prev,
        images: error.message || 'Resimler yüklenirken bir hata oluştu.'
      }));
    } finally {
      setIsUploading(false);
    }
  };
  
  // Formu doğrula
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
        image: formData.image,
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mercedes Vito VIP"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.make ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mercedes"
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.model ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Vito"
            />
            {errors.model && <p className="mt-1 text-sm text-red-500">{errors.model}</p>}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="VIP">VIP</option>
              <option value="Sedan">Sedan</option>
              <option value="Minibüs">Minibüs</option>
            </select>
          </div>
          
          {/* Yolcu Kapasitesi */}
          <div>
            <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Yolcu Kapasitesi <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="passengers"
              name="passengers"
              value={formData.passengers}
              onChange={handleNumberChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.passengers ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.passengers && <p className="mt-1 text-sm text-red-500">{errors.passengers}</p>}
          </div>
          
          {/* Bagaj Kapasitesi */}
          <div>
            <label htmlFor="luggage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bagaj Kapasitesi <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="luggage"
              name="luggage"
              value={formData.luggage}
              onChange={handleNumberChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.luggage ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.luggage && <p className="mt-1 text-sm text-red-500">{errors.luggage}</p>}
          </div>
          
          {/* Fiyat */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Günlük Fiyat (₺) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleNumberChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
          </div>
          
          {/* Durum */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durum <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Araç hakkında detaylı bilgi..."
          />
        </div>
      </div>
      
      {/* Özellikler */}
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium dark:text-white">Özellikler</h3>
          <button
            type="button"
            onClick={addFeature}
            className="flex items-center text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
          >
            <Plus className="h-4 w-4 mr-1" />
            Özellik Ekle
          </button>
        </div>
        
        <div className="space-y-3">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Klima, Wifi, Deri Koltuk vb."
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                disabled={formData.features.length === 1 && !feature}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tek Resim Yükleme */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ana Resim
        </label>
        <div className="mt-1 flex items-center">
          {previewImage ? (
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => {
                  setPreviewImage('');
                  setFormData(prev => ({ ...prev, image: '' }));
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
              <label className="cursor-pointer text-center p-2">
                <Upload className="h-6 w-6 text-gray-400 mx-auto" />
                <span className="mt-2 block text-sm text-gray-400">Resim Yükle</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          )}
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
        </div>
      </div>
      
      {/* Çoklu Resim Yükleme */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Galeri Resimleri (Maksimum 10)
        </label>
        <div className="mt-1">
          <div className="flex flex-wrap gap-2">
            {/* Önizleme resimleri */}
            {previewImages.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newPreviews = [...previewImages];
                    newPreviews.splice(index, 1);
                    setPreviewImages(newPreviews);
                    
                    const newImages = [...formData.images];
                    newImages.splice(index, 1);
                    setFormData(prev => ({ ...prev, images: newImages }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {/* Yükleme butonu */}
            {previewImages.length < 10 && (
              <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                <label className="cursor-pointer text-center p-2">
                  <Upload className="h-5 w-5 text-gray-400 mx-auto" />
                  <span className="mt-1 block text-xs text-gray-400">Resimler Ekle</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleMultipleImageChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>
          
          {errors.images && (
            <p className="mt-1 text-sm text-red-600">{errors.images}</p>
          )}
          
          {isUploading && (
            <div className="mt-2 text-sm text-amber-600">
              Resimler yükleniyor... Lütfen bekleyin.
            </div>
          )}
        </div>
      </div>
      
      {/* Form Butonları */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Kaydet
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CarForm; 