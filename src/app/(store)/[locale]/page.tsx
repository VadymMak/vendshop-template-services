import { setRequestLocale } from 'next-intl/server';
import { db } from '@/lib/db';
import { getStoreConfig } from '@/lib/store-config';
import type { HoursMap } from '@/components/ui/DateTimePicker';
import HeroSection from '@/components/sections/HeroSection';
import DecorativeDivider from '@/components/ui/DecorativeDivider';
import StatsBar from '@/components/sections/StatsBar';
import ServicesSection from '@/components/sections/ServicesSection';
import WhyUsSection from '@/components/sections/WhyUsSection';
import GallerySection from '@/components/sections/GallerySection';
import TeamSection from '@/components/sections/TeamSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import BookingSection from '@/components/sections/BookingSection';
import AboutSection from '@/components/sections/AboutSection';
import ContactSection from '@/components/sections/ContactSection';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // React-cached — deduped with layout's getStoreConfig() call, no extra DB round-trip
  const config = await getStoreConfig();
  const { presence, whatsappLinks } = config;

  const [heroConfig, galleryImages, dbTestimonials] = await Promise.all([
    db.heroConfig.findUnique({ where: { storeId: config.id } }),
    db.galleryImage.findMany({
      where: { storeId: config.id, active: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, url: true, alt: true },
    }),
    db.testimonial.findMany({
      where: { storeId: config.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { customer: { select: { name: true } } },
    }),
  ]);

  return (
    <>
      <HeroSection
        config={heroConfig}
        city={presence.city}
        googleRating={presence.googleRating}
        openingHours={presence.openingHours}
        whatsappBookingLink={whatsappLinks.booking}
        instagram={presence.instagram}
      />
      <DecorativeDivider />
      <StatsBar googleRating={presence.googleRating} />
      <ServicesSection />
      <WhyUsSection city={presence.city} googleRating={presence.googleRating} address={presence.address} />
      <GallerySection images={galleryImages} />
      <TeamSection />
      <TestimonialsSection testimonials={dbTestimonials.map((t) => ({
        id: t.id,
        name: t.customer?.name ?? 'Klient',
        content: t.text,
        rating: t.rating,
        createdAt: t.createdAt.toISOString(),
        adminReply: t.adminReply,
        adminReplyAt: t.adminReplyAt?.toISOString() ?? null,
      }))} />
      <BookingSection
        workingHours={presence.openingHours as HoursMap | undefined}
        whatsappNumber={presence.whatsapp ?? presence.phone ?? undefined}
      />
      <AboutSection
        storeName={config.name}
        founderName={presence.founderName}
        city={presence.city}
      />
      <ContactSection
        address={presence.address}
        city={presence.city}
        phone={presence.phone}
        email={presence.email}
        mapLat={presence.mapCoords?.lat}
        mapLng={presence.mapCoords?.lng}
        workingHours={presence.openingHours}
        whatsappLocationLink={whatsappLinks.location}
      />
      <WhatsAppButton href={whatsappLinks.general} />
    </>
  );
}
