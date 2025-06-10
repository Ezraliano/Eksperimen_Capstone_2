import { Phone, Mail, Globe, Star, Clock, MapPin } from 'lucide-react';
import { Clinic } from '../data/clinics';

interface ClinicCardProps {
  clinic: Clinic;
  onViewOnMap: (clinic: Clinic) => void;
}

const ClinicCard = ({ clinic, onViewOnMap }: ClinicCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
        <img
          src={clinic.image}
          alt={clinic.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full flex items-center gap-1">
          {renderStars(clinic.rating)}
          <span className="text-sm font-medium ml-1">{clinic.rating}</span>
        </div>
      </div>

      <div className="flex-grow">
        <h3 className="text-xl font-semibold mb-2">{clinic.name}</h3>
        
        <div className="flex items-start gap-2 mb-3">
          <MapPin size={16} className="text-gray-500 mt-1 flex-shrink-0" />
          <p className="text-gray-600 text-sm">{clinic.address}</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-gray-500" />
            <span className="text-sm">{clinic.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-gray-500" />
            <span className="text-sm">{clinic.email}</span>
          </div>
          {clinic.website && (
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-gray-500" />
              <a
                href={clinic.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Specialties:</h4>
          <div className="flex flex-wrap gap-2">
            {clinic.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-gray-500" />
            <h4 className="font-medium text-gray-700">Opening Hours:</h4>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Mon-Fri: {clinic.openHours.weekdays}</div>
            <div>Saturday: {clinic.openHours.saturday}</div>
            <div>Sunday: {clinic.openHours.sunday}</div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">{clinic.description}</p>
      </div>

      <button
        onClick={() => onViewOnMap(clinic)}
        className="btn btn-primary w-full flex items-center justify-center gap-2"
      >
        <MapPin size={18} />
        View on Map
      </button>
    </div>
  );
};

export default ClinicCard;