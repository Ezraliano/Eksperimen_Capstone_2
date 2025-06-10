export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  specialties: string[];
  rating: number;
  openHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  image: string;
}

export const jakartaClinics: Clinic[] = [
  {
    id: 'clinic-001',
    name: 'Jakarta Dental Center',
    address: 'Jl. Sudirman No. 123, Tanah Abang, Jakarta Pusat',
    phone: '+62 21 5555 1234',
    email: 'info@jakartadentalcenter.com',
    website: 'https://jakartadentalcenter.com',
    specialties: ['General Dentistry', 'Orthodontics', 'Oral Surgery'],
    rating: 4.8,
    openHours: {
      weekdays: '08:00 - 20:00',
      saturday: '08:00 - 17:00',
      sunday: '09:00 - 15:00'
    },
    coordinates: {
      lat: -6.2088,
      lng: 106.8456
    },
    description: 'Modern dental clinic with state-of-the-art equipment and experienced dentists.',
    image: 'https://images.pexels.com/photos/3779709/pexels-photo-3779709.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 'clinic-002',
    name: 'Smile Care Clinic',
    address: 'Jl. Thamrin No. 456, Menteng, Jakarta Pusat',
    phone: '+62 21 5555 2345',
    email: 'contact@smilecare.co.id',
    specialties: ['Cosmetic Dentistry', 'Implants', 'Periodontics'],
    rating: 4.7,
    openHours: {
      weekdays: '09:00 - 21:00',
      saturday: '09:00 - 18:00',
      sunday: 'Closed'
    },
    coordinates: {
      lat: -6.1944,
      lng: 106.8229
    },
    description: 'Specialized in cosmetic dentistry and smile makeovers with advanced technology.',
    image: 'https://images.pexels.com/photos/3845126/pexels-photo-3845126.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 'clinic-003',
    name: 'Dental Plus Kemang',
    address: 'Jl. Kemang Raya No. 789, Kemang, Jakarta Selatan',
    phone: '+62 21 5555 3456',
    email: 'info@dentalpluskemang.com',
    specialties: ['Pediatric Dentistry', 'General Dentistry', 'Emergency Care'],
    rating: 4.6,
    openHours: {
      weekdays: '08:00 - 19:00',
      saturday: '08:00 - 16:00',
      sunday: '10:00 - 14:00'
    },
    coordinates: {
      lat: -6.2615,
      lng: 106.8106
    },
    description: 'Family-friendly dental clinic specializing in pediatric and general dentistry.',
    image: 'https://images.pexels.com/photos/4269693/pexels-photo-4269693.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 'clinic-004',
    name: 'Elite Dental Pondok Indah',
    address: 'Jl. Metro Pondok Indah No. 321, Pondok Indah, Jakarta Selatan',
    phone: '+62 21 5555 4567',
    email: 'reception@elitedental.id',
    website: 'https://elitedental.id',
    specialties: ['Oral Surgery', 'Prosthodontics', 'Endodontics'],
    rating: 4.9,
    openHours: {
      weekdays: '07:00 - 20:00',
      saturday: '08:00 - 17:00',
      sunday: '09:00 - 15:00'
    },
    coordinates: {
      lat: -6.2659,
      lng: 106.7844
    },
    description: 'Premium dental clinic offering comprehensive oral health services.',
    image: 'https://images.pexels.com/photos/3845545/pexels-photo-3845545.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 'clinic-005',
    name: 'Dental Care Kelapa Gading',
    address: 'Mall of Indonesia, Lt. 3, Kelapa Gading, Jakarta Utara',
    phone: '+62 21 5555 5678',
    email: 'info@dentalcarekg.com',
    specialties: ['General Dentistry', 'Teeth Whitening', 'Braces'],
    rating: 4.5,
    openHours: {
      weekdays: '10:00 - 22:00',
      saturday: '10:00 - 22:00',
      sunday: '10:00 - 21:00'
    },
    coordinates: {
      lat: -6.1588,
      lng: 106.9056
    },
    description: 'Conveniently located in mall with flexible hours and modern facilities.',
    image: 'https://images.pexels.com/photos/3779709/pexels-photo-3779709.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 'clinic-006',
    name: 'Bright Smile Clinic',
    address: 'Jl. Gatot Subroto No. 654, Setiabudi, Jakarta Selatan',
    phone: '+62 21 5555 6789',
    email: 'hello@brightsmile.co.id',
    specialties: ['Orthodontics', 'Cosmetic Dentistry', 'General Care'],
    rating: 4.4,
    openHours: {
      weekdays: '08:30 - 19:30',
      saturday: '08:30 - 17:00',
      sunday: 'Closed'
    },
    coordinates: {
      lat: -6.2297,
      lng: 106.8253
    },
    description: 'Focused on creating beautiful smiles with personalized treatment plans.',
    image: 'https://images.pexels.com/photos/3845126/pexels-photo-3845126.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 'clinic-007',
    name: 'Family Dental Clinic',
    address: 'Jl. Cikini Raya No. 987, Cikini, Jakarta Pusat',
    phone: '+62 21 5555 7890',
    email: 'care@familydental.id',
    specialties: ['Family Dentistry', 'Preventive Care', 'Dental Hygiene'],
    rating: 4.3,
    openHours: {
      weekdays: '09:00 - 18:00',
      saturday: '09:00 - 15:00',
      sunday: 'Closed'
    },
    coordinates: {
      lat: -6.1944,
      lng: 106.8456
    },
    description: 'Comprehensive family dental care with emphasis on preventive treatments.',
    image: 'https://images.pexels.com/photos/4269693/pexels-photo-4269693.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 'clinic-008',
    name: 'Modern Dental PIK',
    address: 'Pantai Indah Kapuk, Jl. Pantai Indah Utara No. 147, Jakarta Utara',
    phone: '+62 21 5555 8901',
    email: 'info@moderndentalpik.com',
    website: 'https://moderndentalpik.com',
    specialties: ['Digital Dentistry', 'Implants', 'Laser Treatment'],
    rating: 4.7,
    openHours: {
      weekdays: '08:00 - 20:00',
      saturday: '08:00 - 18:00',
      sunday: '10:00 - 16:00'
    },
    coordinates: {
      lat: -6.1088,
      lng: 106.7539
    },
    description: 'Cutting-edge dental technology with digital imaging and laser treatments.',
    image: 'https://images.pexels.com/photos/3845545/pexels-photo-3845545.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 'clinic-009',
    name: 'Dental Wellness Center',
    address: 'Jl. Rasuna Said No. 258, Kuningan, Jakarta Selatan',
    phone: '+62 21 5555 9012',
    email: 'wellness@dentalwellness.id',
    specialties: ['Holistic Dentistry', 'TMJ Treatment', 'Sleep Apnea'],
    rating: 4.6,
    openHours: {
      weekdays: '07:30 - 19:00',
      saturday: '08:00 - 16:00',
      sunday: '09:00 - 14:00'
    },
    coordinates: {
      lat: -6.2297,
      lng: 106.8317
    },
    description: 'Holistic approach to dental health with focus on overall wellness.',
    image: 'https://images.pexels.com/photos/3779709/pexels-photo-3779709.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 'clinic-010',
    name: 'Jakarta Orthodontic Center',
    address: 'Jl. HR Rasuna Said No. 369, Menteng Dalam, Jakarta Selatan',
    phone: '+62 21 5555 0123',
    email: 'ortho@jakartaortho.com',
    website: 'https://jakartaortho.com',
    specialties: ['Orthodontics', 'Invisalign', 'Jaw Surgery'],
    rating: 4.8,
    openHours: {
      weekdays: '08:00 - 19:00',
      saturday: '08:00 - 17:00',
      sunday: 'By Appointment'
    },
    coordinates: {
      lat: -6.2297,
      lng: 106.8456
    },
    description: 'Specialized orthodontic center with latest braces and alignment technologies.',
    image: 'https://images.pexels.com/photos/3845126/pexels-photo-3845126.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
];