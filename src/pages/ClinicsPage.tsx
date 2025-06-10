import { useState, useEffect } from 'react';
import { Search, MapPin, List, Filter } from 'lucide-react';
import { jakartaClinics, Clinic } from '../data/clinics';
import ClinicCard from '../components/ClinicCard';
import ClinicMap from '../components/ClinicMap';

const ClinicsPage = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isLoading, setIsLoading] = useState(true);

  // Get all unique specialties
  const allSpecialties = Array.from(
    new Set(jakartaClinics.flatMap(clinic => clinic.specialties))
  ).sort();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setClinics(jakartaClinics);
      setFilteredClinics(jakartaClinics);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = clinics;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(clinic =>
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.specialties.some(specialty =>
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(clinic =>
        clinic.specialties.includes(selectedSpecialty)
      );
    }

    setFilteredClinics(filtered);
  }, [searchTerm, selectedSpecialty, clinics]);

  const handleViewOnMap = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setViewMode('map');
  };

  const handleClinicSelect = (clinic: Clinic) => {
    setSelectedClinic(clinic);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading dental clinics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Dental Clinics in Jakarta</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Find the best dental clinics in Jakarta with detailed information about services, 
            locations, and contact details.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search clinics by name, location, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={20} className="text-gray-400" />
                </div>
                <select
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none min-w-[200px]"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <option value="">All Specialties</option>
                  {allSpecialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {filteredClinics.length} clinic{filteredClinics.length !== 1 ? 's' : ''} found
              </span>
            </div>
            
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
                <span>List View</span>
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  viewMode === 'map'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
                onClick={() => setViewMode('map')}
              >
                <MapPin size={18} />
                <span>Map View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClinics.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                onViewOnMap={handleViewOnMap}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Clinic List Sidebar */}
            <div className="lg:col-span-1 max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {filteredClinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    className={`card p-4 cursor-pointer transition-all ${
                      selectedClinic?.id === clinic.id
                        ? 'ring-2 ring-primary-500 bg-primary-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleClinicSelect(clinic)}
                  >
                    <div className="flex gap-3">
                      <img
                        src={clinic.image}
                        alt={clinic.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{clinic.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{clinic.address}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                index < Math.floor(clinic.rating)
                                  ? 'bg-yellow-400'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs ml-1">{clinic.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-2 h-[600px] rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <ClinicMap
                clinics={filteredClinics}
                selectedClinic={selectedClinic}
                onClinicSelect={handleClinicSelect}
              />
            </div>
          </div>
        )}

        {filteredClinics.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No clinics found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or browse all available clinics.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicsPage;