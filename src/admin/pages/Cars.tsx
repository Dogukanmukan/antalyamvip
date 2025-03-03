import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Search, Plus, ChevronLeft, ChevronRight, AlertCircle, Car
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { carsAPI } from '../utils/api';
import CarCard from '../components/CarCard';
import CarDetailModal from '../components/CarDetailModal';
import CarForm from '../components/CarForm';

// Araç arayüzü
interface Car {
  id: number;
  name: string;
  make: string;
  model: string;
  category: string;
  seats: number;
  luggage: number;
  price_per_day: number;
  status: 'active' | 'maintenance' | 'inactive';
  description?: string;
  features?: string[];
  images?: string[];
}

// Cars bileşeni
interface CarsProps {
  isAddMode?: boolean;
  isEditMode?: boolean;
}

const Cars: React.FC<CarsProps> = ({ isAddMode, isEditMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCar, setCurrentCar] = useState<Car | null>(null);
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const carsPerPage = 8;
  
  // Sayfa yüklendiğinde araçları getir
  useEffect(() => {
    fetchCars();
  }, []);
  
  // Eğer düzenleme modundaysa, URL'den araç ID'sini al ve o aracı yükle
  useEffect(() => {
    if (isEditMode && id) {
      fetchCarById(parseInt(id, 10));
    }
  }, [isEditMode, id]);
  
  // Araçları getir
  const fetchCars = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching cars from API...');
      const response = await carsAPI.getAll();
      console.log('Cars API response:', response);
      
      // API yanıtının yapısını kontrol et
      let carsArray = [];
      
      if (response && Array.isArray(response)) {
        // Doğrudan dizi formatı
        carsArray = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // { data: [...] } formatı
        carsArray = response.data;
      } else if (response && typeof response === 'object') {
        // Tek bir nesne olabilir, dizi içine al
        carsArray = [response];
      }
      
      console.log(`Processed ${carsArray.length} cars:`, carsArray);
      
      // İlk aracın tüm detaylarını konsola yazdır
      if (carsArray.length > 0) {
        console.log('İlk araç tüm detayları:', carsArray[0]);
        console.log('İlk araç images alanı:', {
          images: carsArray[0].images,
          type: typeof carsArray[0].images,
          isArray: Array.isArray(carsArray[0].images),
          keys: carsArray[0].images ? Object.keys(carsArray[0].images) : 'yok'
        });
      }
      
      // JSON string olarak gelen alanları parse et
      const processedCars = carsArray.map((car: any) => {
        // images alanını kontrol et
        if (!car.images) {
          // images alanı yoksa boş dizi ata
          car.images = [];
          console.log(`Araç ID ${car.id} için images alanı yok, boş dizi atandı`);
        } else if (typeof car.images === 'string') {
          try {
            // Boş string kontrolü
            if (car.images.trim() === '') {
              car.images = [];
              console.log(`Araç ID ${car.id} için images boş string, boş dizi atandı`);
            } else {
              // Eğer string olarak geldiyse parse et (eski veriler için)
              car.images = JSON.parse(car.images);
              console.log(`Araç ID ${car.id} için images string'den parse edildi:`, car.images);
            }
          } catch (e) {
            console.error(`Araç ID ${car.id} için images parse hatası:`, e);
            car.images = [];
          }
        } else if (Array.isArray(car.images)) {
          // Dizi olarak geldiyse null değerleri temizle
          car.images = car.images.filter((img: any) => img !== null && img !== 'null' && img !== '');
          console.log(`Araç ID ${car.id} için images dizisinden null değerler temizlendi:`, car.images);
        } else {
          console.log(`Araç ID ${car.id} için images alanı beklenmeyen formatta:`, car.images);
          car.images = [];
        }
        
        // features alanını kontrol et ve parse et
        if (car.features && typeof car.features === 'string') {
          try {
            car.features = JSON.parse(car.features);
          } catch (e) {
            console.error('Error parsing car features:', e);
            car.features = [];
          }
        }
        
        return car;
      });
      
      // İşlenmiş ilk aracın detaylarını konsola yazdır
      if (processedCars.length > 0) {
        console.log('İşlenmiş ilk araç detayları:', {
          id: processedCars[0].id,
          name: processedCars[0].name,
          image: processedCars[0].image,
          images: processedCars[0].images,
          imagesType: processedCars[0].images ? typeof processedCars[0].images : 'undefined',
          imagesIsArray: processedCars[0].images ? Array.isArray(processedCars[0].images) : false
        });
      }
      
      setCars(processedCars);
      setFilteredCars(processedCars);
    } catch (err) {
      console.error('Araçlar yüklenirken hata:', err);
      setError('Araçlar yüklenirken bir hata oluştu.');
      // Hata durumunda boş dizi kullan
      setCars([]);
      setFilteredCars([]);
    } finally {
      setLoading(false);
    }
  };
  
  // ID'ye göre araç getir
  const fetchCarById = async (carId: number) => {
    setLoading(true);
    setError('');
    
    try {
      const car = await carsAPI.getById(carId);
      
      // JSON string olarak gelen alanları parse et
      if (!car.images) {
        // images alanı yoksa boş dizi ata
        car.images = [];
        console.log(`Araç ID ${car.id} için images alanı yok, boş dizi atandı`);
      } else if (typeof car.images === 'string') {
        try {
          // Boş string kontrolü
          if (car.images.trim() === '') {
            car.images = [];
            console.log(`Araç ID ${car.id} için images boş string, boş dizi atandı`);
          } else {
            // Eğer string olarak geldiyse parse et (eski veriler için)
            car.images = JSON.parse(car.images);
            console.log(`Araç ID ${car.id} için images string'den parse edildi:`, car.images);
          }
        } catch (e) {
          console.error(`Araç ID ${car.id} için images parse hatası:`, e);
          car.images = [];
        }
      } else if (Array.isArray(car.images)) {
        // Dizi olarak geldiyse null değerleri temizle
        car.images = car.images.filter((img: any) => img !== null && img !== 'null' && img !== '');
        console.log(`Araç ID ${car.id} için images dizisinden null değerler temizlendi:`, car.images);
      } else {
        console.log(`Araç ID ${car.id} için images alanı beklenmeyen formatta:`, car.images);
        car.images = [];
      }
      
      if (car.features && typeof car.features === 'string') {
        try {
          car.features = JSON.parse(car.features);
        } catch (e) {
          console.error('Error parsing car features:', e);
          car.features = [];
        }
      }
      
      setCurrentCar(car);
    } catch (err) {
      setError('Araç bilgileri yüklenirken bir hata oluştu.');
      console.error('Araç bilgileri yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Araç sil
  const handleDeleteCar = async (id: number) => {
    try {
      await carsAPI.delete(id);
      setCars(cars.filter(car => car.id !== id));
      setFilteredCars(filteredCars.filter(car => car.id !== id));
    } catch (err: any) {
      // 409 hatası (Conflict) - Rezervasyonu olan araç silinemiyor
      if (err.response && err.response.status === 409) {
        setError('Bu araç rezervasyonlara bağlı olduğu için silinemiyor.');
      } else {
        setError('Araç silinirken bir hata oluştu.');
      }
      console.error('Araç silinirken hata:', err);
    }
  };
  
  // Araç düzenleme sayfasına git
  const handleEditCar = (id: number) => {
    navigate(`/admin/cars/edit/${id}`);
  };
  
  // Yeni araç ekleme sayfasına git
  const handleAddCar = () => {
    navigate('/admin/cars/add');
  };
  
  // Araç detaylarını görüntüle
  const handleViewCar = (car: Car) => {
    setSelectedCar(car);
  };
  
  // Araç ekleme veya güncelleme
  const handleSubmitCar = async (formData: any) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Form verisi (handleSubmitCar):', formData);
      console.log('images tipi:', typeof formData.images, 'değeri:', formData.images);
      
      if (isEditMode && currentCar) {
        // Araç güncelleme
        await carsAPI.update(currentCar.id, formData);
        navigate('/admin/cars');
      } else {
        // Yeni araç ekleme
        await carsAPI.create(formData);
        navigate('/admin/cars');
      }
    } catch (err) {
      setError('Araç kaydedilirken bir hata oluştu.');
      console.error('Araç kaydedilirken hata:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // İptal et ve araçlar sayfasına dön
  const handleCancel = () => {
    navigate('/admin/cars');
  };
  
  // Filtreleme ve arama işlemleri
  useEffect(() => {
    let result = cars;
    
    // Arama filtresi
    if (searchTerm) {
      result = result.filter(car => 
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Kategori filtresi
    if (categoryFilter !== 'all') {
      result = result.filter(car => car.category === categoryFilter);
    }
    
    // Durum filtresi
    if (statusFilter !== 'all') {
      result = result.filter(car => car.status === statusFilter);
    }
    
    setFilteredCars(result);
    setCurrentPage(1); // Filtreleme yapıldığında ilk sayfaya dön
  }, [searchTerm, categoryFilter, statusFilter, cars]);
  
  // Sayfalama
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);
  
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Yükleme durumu
  if (loading && (isEditMode || isAddMode)) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </AdminLayout>
    );
  }

  // Render
  return (
    <AdminLayout>
      {/* Araç detay modalı */}
      {selectedCar && (
        <CarDetailModal car={selectedCar} isOpen={!!selectedCar} onClose={() => setSelectedCar(null)} />
      )}
      
      {/* Silme onay modalı */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-4 dark:text-white">Aracı Sil</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">Bu aracı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  if (deleteId !== null) {
                    handleDeleteCar(deleteId);
                  }
                  setIsDeleting(false);
                }}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-white hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Ana içerik */}
      {isAddMode ? (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold dark:text-white">Yeni Araç Ekle</h1>
            <button
              onClick={() => navigate('/admin/cars')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              İptal
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 dark:bg-red-900/30 dark:border-red-500/50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <CarForm 
            onSubmit={handleSubmitCar}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : isEditMode ? (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold dark:text-white">Araç Düzenle</h1>
            <button
              onClick={() => navigate('/admin/cars')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              İptal
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 dark:bg-red-900/30 dark:border-red-500/50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {currentCar && (
            <CarForm 
              initialData={currentCar}
              onSubmit={handleSubmitCar}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      ) : (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold dark:text-white">Araçlar</h1>
            <button
              onClick={handleAddCar}
              className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Yeni Araç Ekle
            </button>
          </div>
          
          {/* Arama ve filtreleme */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 dark:bg-gray-800">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="relative flex-grow mb-4 md:mb-0">
                <input
                  type="text"
                  placeholder="Araç ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <div className="mb-4 sm:mb-0">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">Tüm Kategoriler</option>
                    <option value="VIP">VIP</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Minibüs">Minibüs</option>
                  </select>
                </div>
                
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="active">Aktif</option>
                    <option value="maintenance">Bakımda</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hata mesajı */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 dark:bg-red-900/30 dark:border-red-500/50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Yükleniyor */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          )}
          
          {/* Araç kartları */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onEdit={handleEditCar}
                  onDelete={(id) => {
                    setDeleteId(id);
                    setIsDeleting(true);
                  }}
                  onView={handleViewCar}
                />
              ))}
            </div>
          )}
          
          {/* Boş durum */}
          {filteredCars.length === 0 && !loading && (
            <div className="bg-white p-8 rounded-lg shadow-md text-center dark:bg-gray-800">
              <Car className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Araç Bulunamadı</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Arama kriterlerinize uygun araç bulunamadı. Lütfen filtreleri değiştirin veya yeni bir araç ekleyin.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleAddCar}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Yeni Araç Ekle
                </button>
              </div>
            </div>
          )}
          
          {/* Sayfalama */}
          {filteredCars.length > carsPerPage && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.ceil(filteredCars.length / carsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-1 mx-1 rounded-md ${
                      currentPage === index + 1
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredCars.length / carsPerPage)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === Math.ceil(filteredCars.length / carsPerPage)
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default Cars; 