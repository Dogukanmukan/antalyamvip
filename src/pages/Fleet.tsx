import React, { useState, useEffect } from 'react';
import { Car as CarIcon, Filter, Search } from 'lucide-react';
import CarCard from '../components/CarCard';
import PageHeader from '../components/PageHeader';
import { useTranslation } from 'react-i18next';
import { Car } from '../types';

const Fleet = () => {
  const { t } = useTranslation();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Veritabanından araçları çek
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/cars');
        
        if (!response.ok) {
          throw new Error('Araçlar yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setCars(data);
        setFilteredCars(data);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Araçlar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCars();
  }, []);

  const categories = ['All', ...new Set(cars.map(car => car.category))];

  const handleFilterChange = (category: string) => {
    setActiveFilter(category);
    if (category === 'All') {
      setFilteredCars(cars.filter(car => 
        car.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredCars(cars.filter(car => 
        car.category === category && 
        car.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (activeFilter === 'All') {
      setFilteredCars(cars.filter(car => 
        car.name.toLowerCase().includes(term.toLowerCase())
      ));
    } else {
      setFilteredCars(cars.filter(car => 
        car.category === activeFilter && 
        car.name.toLowerCase().includes(term.toLowerCase())
      ));
    }
  };

  return (
    <div>
      <PageHeader 
        title={t('fleet.title')} 
        description={t('fleet.subtitle')}
        backgroundImage="/images/cars/banner/banner3.png"
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Search and Filter */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder={t('fleet.searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2">
                <Filter className="text-amber-500 mr-1" size={20} />
                <span className="text-gray-700 font-medium mr-2">{t('fleet.filter')}:</span>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                      activeFilter === category
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleFilterChange(category)}
                  >
                    {category === 'All' ? t('fleet.categories.all') : 
                     category === 'Luxury' ? t('fleet.categories.luxury') :
                     category === 'VIP' ? t('fleet.categories.vip') :
                     category === 'Ultra Luxury' ? t('fleet.categories.ultraLuxury') : category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="spinner mx-auto"></div>
              <p className="text-gray-500 mt-4">{t('common.loading')}</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('common.error')}</h3>
              <p className="text-gray-500">{error}</p>
            </div>
          )}

          {/* Fleet Grid */}
          {!loading && !error && filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : !loading && !error ? (
            <div className="text-center py-16">
              <CarIcon className="mx-auto text-gray-300" size={64} />
              <h3 className="text-xl font-bold mt-4 mb-2">{t('fleet.noVehicles')}</h3>
              <p className="text-gray-500">{t('fleet.adjustSearch')}</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default Fleet;