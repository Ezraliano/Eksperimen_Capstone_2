import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { Clinic } from '../data/clinics';
import { Phone, Mail, Star, Clock } from 'lucide-react';

// Custom marker icon
const clinicIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface ClinicMapProps {
  clinics: Clinic[];
  selectedClinic?: Clinic | null;
  onClinicSelect: (clinic: Clinic) => void;
}

// Component to handle map centering when a clinic is selected
const MapController = ({ selectedClinic }: { selectedClinic?: Clinic | null }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedClinic) {
      map.setView([selectedClinic.coordinates.lat, selectedClinic.coordinates.lng], 15);
    }
  }, [selectedClinic, map]);

  return null;
};

const ClinicMap = ({ clinics, selectedClinic, onClinicSelect }: ClinicMapProps) => {
  const mapRef = useRef<any>(null);

  // Jakarta center coordinates
  const jakartaCenter: LatLngTuple = [-6.2088, 106.8456];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={12}
        className={`inline ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="h-full w-full">
      <MapContainer
        center={jakartaCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController selectedClinic={selectedClinic} />
        
        {clinics.map((clinic) => (
          <Marker
            key={clinic.id}
            position={[clinic.coordinates.lat, clinic.coordinates.lng]}
            icon={clinicIcon}
            eventHandlers={{
              click: () => onClinicSelect(clinic),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[250px]">
                <img
                  src={clinic.image}
                  alt={clinic.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-lg mb-1">{clinic.name}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(clinic.rating)}
                  <span className="text-sm ml-1">{clinic.rating}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{clinic.address}</p>
                
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={12} />
                    <span>{clinic.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={12} />
                    <span>{clinic.email}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock size={12} />
                    <span className="text-sm font-medium">Hours:</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div>Mon-Fri: {clinic.openHours.weekdays}</div>
                    <div>Sat: {clinic.openHours.saturday}</div>
                    <div>Sun: {clinic.openHours.sunday}</div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {clinic.specialties.slice(0, 2).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {clinic.specialties.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{clinic.specialties.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ClinicMap;