export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type ReviewsMode = 'static' | 'dynamic';
export type Theme = 'dark' | 'light' | 'warm' | 'navy';
export type DigitalType = 'COURSE' | 'EBOOK' | 'VIDEO' | 'TEMPLATE';

export interface ServiceItem {
  id: string;
  slug: string;
  nameKey: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  image: string | null;
  category: string | null;
}

export interface MasterItem {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo: string | null;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BookingFormData {
  serviceId: string;
  masterId: string | null;
  date: string;
  timeSlot: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  note?: string;
}

export interface CourseItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  lessonCount: number;
}

export interface StaticTestimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar?: string;
}

export interface GalleryImageItem {
  src: string;
  alt: string;
}

export interface HoursRow {
  day: string;
  time: string;
}

export interface AppointmentRow {
  id: string;
  guestName: string | null;
  guestPhone: string | null;
  serviceName: string;
  masterName: string | null;
  date: Date;
  timeSlot: string;
  status: AppointmentStatus;
  note: string | null;
}

// Kate-barber display types (used in sections)
export interface Service {
  name: string;
  description: string;
  price: string;
}

export interface TeamMember {
  name: string;
  role: string;
  experience: string;
  photo: string;
}

export interface Testimonial {
  stars: number;
  text: string;
  author: string;
  date: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface Stat {
  number: string;
  label: string;
}

export interface WhyUsItem {
  icon: string;
  title: string;
  description: string;
}

export interface BookingTimeSlot {
  value: string;
}
