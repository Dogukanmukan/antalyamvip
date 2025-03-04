import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Upload } from 'lucide-react';
import api from '../utils/api-compat';

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
    image: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Form ilk yüklendiğinde veya initialData değiştiğinde formu doldur
  useEffect(() => {
    if (initialData) {
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
        image: initialData.image || ''
      });
      
      if (initialData.image) {
        setPreviewImage(initialData.image);
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
        if (!token) {
          console.error('Oturum açılmamış, resim yüklenemez');
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
        image: formData.image
      };
      
      console.log('Gönderilen form verisi:', apiFormData);
      
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
      
      {/* Resim Yükleme */}
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Araç Görseli</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Görsel Yükle
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Yüklemek için tıklayın</span> veya sürükleyip bırakın
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG veya WEBP (Maks. 5MB)
                  </p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Önizleme
            </label>
            <div className="border border-gray-300 rounded-lg h-32 flex items-center justify-center overflow-hidden dark:border-gray-600">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Araç önizleme"
                  className="h-full w-full object-cover"
                />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Görsel yüklenmedi</p>
              )}
            </div>
          </div>
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