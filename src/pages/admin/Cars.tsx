import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

interface Car {
  id: number;
  name: string;
  category: string;
  images: string[];
  year: number;
  fuel_type: string;
  seats: number;
  features: string[];
  price_per_day: number | null;
}

const AdminCars: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedLoading, setSeedLoading] = useState(false);

  // Kimlik doğrulama kontrolü
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
      fetchCars();
    }
  }, [navigate]);

  // Araçları getir
  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cars');
      if (!response.ok) {
        throw new Error('Araçlar yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setCars(data);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Araçlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Araç sil
  const deleteCar = async (id: number) => {
    if (!confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/cars/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Araç silinirken bir hata oluştu');
      }

      setCars(cars.filter(car => car.id !== id));
      alert('Araç başarıyla silindi.');
    } catch (err) {
      console.error('Error deleting car:', err);
      alert('Araç silinirken bir hata oluştu.');
    }
  };

  // Örnek araçları yükle
  const seedCars = async () => {
    if (!confirm('Örnek araçları veritabanına eklemek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setSeedLoading(true);
      const response = await fetch('/api/seed-cars', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Araçlar eklenirken bir hata oluştu');
      }

      alert(result.message);
      fetchCars(); // Araçları yeniden yükle
    } catch (err) {
      console.error('Error seeding cars:', err);
      alert(err.message || 'Araçlar eklenirken bir hata oluştu.');
    } finally {
      setSeedLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Araç Yönetimi" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Araçlar</h1>
            <div className="flex space-x-4">
              {cars.length === 0 && (
                <button
                  onClick={seedCars}
                  disabled={seedLoading}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {seedLoading ? 'Yükleniyor...' : 'Örnek Araçları Yükle'}
                </button>
              )}
              <button
                onClick={() => navigate('/admin/cars/add')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
              >
                Yeni Araç Ekle
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <div className="spinner"></div>
              <p className="mt-2 text-gray-600">Araçlar yükleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resim
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Araç Bilgileri
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Özellikler
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {car.images && car.images.length > 0 ? (
                          <img 
                            src={car.images[0]} 
                            alt={car.name} 
                            className="h-16 w-24 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-16 w-24 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Resim Yok</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{car.name}</div>
                        <div className="text-sm text-gray-500">{car.year} • {car.seats} Kişilik</div>
                        <div className="text-sm text-gray-500">{car.fuel_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                          {car.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 flex flex-wrap gap-1">
                          {car.features && car.features.slice(0, 3).map((feature, index) => (
                            <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-md">
                              {feature}
                            </span>
                          ))}
                          {car.features && car.features.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-md">
                              +{car.features.length - 3} daha
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/cars/edit/${car.id}`)}
                          className="text-amber-600 hover:text-amber-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => deleteCar(car.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminCars;
