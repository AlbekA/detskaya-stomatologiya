export type ServiceCategory = 'Лечение' | 'Профилактика' | 'Прикус' | 'Во сне';

export interface ServiceItem {
  id: string;
  title: string;
  category: ServiceCategory;
  price: string;
  duration: string;
  shortDesc: string;
  fullDesc: string;
  outcome: string;
  beforeImage: string;
  afterImage: string;
  featured?: boolean;
}

export interface DoctorItem {
  id: string;
  name: string;
  role: string;
  experience: string;
  education: string;
  bio: string;
  image: string;
  specialtyTag: string;
}

export interface BeforeAfterCase {
  id: string;
  title: string;
  category: string;
  doctor: string;
  duration: string;
  description: string;
  beforeImage: string;
  afterImage: string;
}

export interface ReviewItem {
  id: string;
  patientName: string;
  service: string;
  date: string;
  rating: number;
  beforeNote: string;
  outcomeText: string;
}

export interface ClinicSettings {
  name: string;
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  email: string;
  hours: string;
  license: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutText: string;
}

export interface ClinicContent {
  settings: ClinicSettings;
  services: ServiceItem[];
  doctors: DoctorItem[];
  cases: BeforeAfterCase[];
  reviews: ReviewItem[];
}

export type BookingStatus = 'new' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingItem {
  id: string;
  name: string;
  phone: string;
  service: string;
  doctor: string;
  preferredDate: string;
  comment: string;
  status: BookingStatus;
  createdAt: string;
  adminNote: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}
