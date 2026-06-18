import type { ServiceItem, MasterItem, StaticTestimonial, GalleryImageItem, HoursRow, Service, TeamMember, Testimonial, GalleryImage, Stat, WhyUsItem } from './types';

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '421900123456';
export const WHATSAPP_LINKS = {
  booking:  `https://wa.me/${WHATSAPP_NUMBER}?text=Dobr%C3%BD%20de%C5%88%2C%20chcel%20by%20som%20si%20rezervova%C5%A5%20term%C3%ADn.`,
  location: `https://wa.me/${WHATSAPP_NUMBER}?text=Dobr%C3%BD%20de%C5%88%2C%20kde%20presne%20sa%20nach%C3%A1dzate%3F`,
  general:  `https://wa.me/${WHATSAPP_NUMBER}?text=Dobr%C3%BD%20de%C5%88%2C%20m%C3%A1m%20ot%C3%A1zku.`,
};

// Static services (used when DB not seeded yet or in static mode)
export const STATIC_SERVICES: ServiceItem[] = [
  { id: 's1', slug: 'haircut',    nameKey: 'services.haircut',   name: 'Pánsky strih',     description: 'Klasický pánsky strih prispôsobený tvaru tváre.', price: 15, duration: 45, image: '/services/haircut.webp',  category: 'Hair'  },
  { id: 's2', slug: 'beard-trim', nameKey: 'services.beard',     name: 'Úprava brady',     description: 'Precízna úprava a tvarovanie brady.', price: 10, duration: 30, image: '/services/beard.webp',    category: 'Beard' },
  { id: 's3', slug: 'hair-beard', nameKey: 'services.hairBeard', name: 'Strih + brada',    description: 'Kombinácia strihu a úpravy brady za zvýhodnenú cenu.', price: 22, duration: 60, image: '/services/combo.webp',    category: 'Hair'  },
  { id: 's4', slug: 'styling',    nameKey: 'services.styling',   name: 'Styling vlasov',   description: 'Profesionálny styling s kvalitnými produktmi.', price: 12, duration: 30, image: '/services/styling.webp', category: 'Styling' },
];

// Static masters (used in static mode)
export const STATIC_MASTERS: MasterItem[] = [
  { id: 'm1', name: 'Kate',   role: 'Senior Barber',  bio: 'Skúsená barberka s 7 rokmi praxe. Špecialistka na klasické strihy a modernú úpravu brady.', photo: '/team/team-kate.webp'   },
  { id: 'm2', name: 'Lucia',  role: 'Hair Stylist',   bio: 'Expertka na dámske aj pánske strihanie. Absolventka medzinárodného kurzu v Prahe.', photo: '/team/team-lucia.webp'  },
  { id: 'm3', name: 'Martin', role: 'Beard Master',   bio: 'Majster holenia a úpravy brady. Špecialista na tradičné holičské techniky.', photo: '/team/team-martin.webp' },
];

export const STATIC_TESTIMONIALS: StaticTestimonial[] = [
  { id: 't1', name: 'Tomáš K.',  text: 'Najlepší barber v Trenčíne. Kate vie presne čo chcete ešte predtým, ako to poviete.',  rating: 5 },
  { id: 't2', name: 'Martin P.', text: 'Skvelá atmosféra, profesionálny prístup. Chodím sem každé 3 týždne.',                 rating: 5 },
  { id: 't3', name: 'Lukáš D.',  text: 'Lucia odviedla fantastickú prácu s mojou bradou. Rozhodne odporúčam!',                rating: 5 },
  { id: 't4', name: 'Miroslav S.',text: 'Kvalita za férovú cenu. Studio vyzerá skvele a personál je veľmi príjemný.',          rating: 5 },
];

export const GALLERY_IMAGES: GalleryImageItem[] = [
  { src: '/gallery/gallery-1-chair.webp',   alt: 'Štýlové barbershop kreslo' },
  { src: '/gallery/gallery-2-haircut.webp', alt: 'Presný strih' },
  { src: '/gallery/gallery-3-beard.webp',   alt: 'Briadkový styling' },
  { src: '/gallery/gallery-4-result.webp',  alt: 'Výsledok - perfektný strih' },
  { src: '/gallery/gallery-5-studio.webp',  alt: 'Kate Barber Studio interiér' },
];

export const BUSINESS_HOURS: HoursRow[] = [
  { day: 'Pondelok – Piatok', time: '09:00 – 19:00' },
  { day: 'Sobota',            time: '09:00 – 14:00' },
  { day: 'Nedeľa',            time: 'Zatvorené'     },
];

export const CONTACT = {
  city:        'Trenčín',
  address:     'Mierové námestie 10\n911 01 Trenčín',
  phone:       '+421 900 123 456',
  phoneHref:   'tel:+421900123456',
  email:       'info@katebarber.sk',
  emailHref:   'mailto:info@katebarber.sk',
  instagram:   'https://instagram.com/katebarber',
  facebook:    'https://facebook.com/katebarber',
  mapSrc:      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2628.4!2d18.044!3d48.894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDUzJzM4LjAiTiAxOMKwMDInMzguMCJF!5e0!3m2!1sen!2ssk!4v1234567890',
};

// Time slot generation helpers
export const BUSINESS_START = '09:00';
export const BUSINESS_END   = '19:00';
export const SLOT_INTERVAL  = 30; // minutes

// Alias for ContactSection
export const HOURS: HoursRow[] = BUSINESS_HOURS;

// Kate-barber display data (used in sections)
export const SERVICES: Service[] = [
  { name: 'Pánsky strih',       description: 'Klasický alebo moderný strih, konzultácia zahrnutá',       price: '€15' },
  { name: 'Úprava brady',       description: 'Tvarovanie, zastrihnutie a ošetrenie brady',               price: '€10' },
  { name: 'Strih + Brada',      description: 'Kompletný balík — strih vlasov aj úprava brady',           price: '€22' },
  { name: 'Klasické holenie',   description: 'Horúci uterák, pena a britva — tradičný rituál',           price: '€18' },
  { name: 'Starostlivosť o pleť', description: 'Hĺbkové čistenie, maska a hydratácia',                  price: '€25' },
  { name: 'Detský strih',       description: 'Pre malých gentlemanov do 12 rokov',                      price: '€10' },
  { name: 'Otec + Syn',         description: 'Spoločný strih pre otca a syna — zľava 15%',              price: '€22' },
  { name: 'VIP Balík',          description: 'Strih, brada, holenie, pleť — kompletný grooming',        price: '€45' },
];

export const TEAM: TeamMember[] = [
  { name: 'Kate Novák',   role: 'Zakladateľka',    experience: '8 rokov skúseností', photo: '/team/team-kate.webp'   },
  { name: 'Lucia Svoboda', role: 'Senior barberka', experience: '5 rokov skúseností', photo: '/team/team-lucia.webp'  },
  { name: 'Martin Blaho', role: 'Barber',           experience: '3 roky skúseností',  photo: '/team/team-martin.webp' },
];

export const STATS: Stat[] = [
  { number: '7+',   label: 'Rokov skúseností'  },
  { number: '12K+', label: 'Spokojných klientov' },
  { number: '4',    label: 'Profesionálni barberi' },
  { number: '4.9',  label: 'Google hodnotenie'  },
];

export const TESTIMONIALS: Testimonial[] = [
  { stars: 5, text: '"Najlepší barber shop v Trenčíne. Kate presne vie, čo chcem, aj keď to neviem vysvetliť. Atmosféra je skvelá, vždy odchádzam spokojný."', author: 'Peter N.',   date: 'Google recenzia · marec 2026'  },
  { stars: 5, text: '"Chodím sem s malým synom — obaja odchádzame ako noví ľudia. Balík Otec + Syn je geniálny nápad. Veľký palec hore!"',                     author: 'Marek K.',   date: 'Google recenzia · február 2026' },
  { stars: 5, text: '"Klasické holenie tu je zážitok. Horúci uterák, voňavá pena, a výsledok dokonalý. Odporúčam každému."',                                   author: 'Jakub V.',   date: 'Google recenzia · január 2026'  },
];

export const BARBERS: string[] = STATIC_MASTERS.map(m => m.name);
export const SERVICE_OPTIONS: string[] = SERVICES.map(s => `${s.name} — ${s.price}`);

export const WHY_US_ITEMS: WhyUsItem[] = [
  { icon: 'scissors', title: 'Vieme, že si originál',        description: 'Nekopírujeme. Chceme vyzdvihnúť tvoju jedinečnosť.'                        },
  { icon: 'location', title: 'Sme v centre Trenčína',        description: 'Nájdeš nás na Mierovom námestí, priamo v srdci mesta.'                    },
  { icon: 'trend',    title: 'Sledujeme trendy',             description: 'Najnovšie strihy aj klasika v podaní profesionálnych barberov.'           },
  { icon: 'star',     title: 'Sme profesionáli',             description: 'Každý barber v tíme má minimálne 3 roky skúseností.'                      },
  { icon: 'click',    title: 'Objednávka na 3 kliky',        description: 'WhatsApp alebo formulár — rezervácia za pár sekúnd.'                      },
  { icon: 'medal',    title: '4.9 na Google',                description: 'Stovky spokojných klientov. Prečítaj si recenzie.'                        },
];
