import { setRequestLocale } from 'next-intl/server';
import { db } from '@/lib/db';
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

const STORE_SLUG = process.env.STORE_SLUG ?? 'kate-barber';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { id: true },
  });

  const [heroConfig, galleryImages] = store
    ? await Promise.all([
        db.heroConfig.findUnique({ where: { storeId: store.id } }),
        db.galleryImage.findMany({
          where: { storeId: store.id, active: true },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, url: true, alt: true },
        }),
      ])
    : [null, []];

  return (
    <>
      <HeroSection config={heroConfig} />
      <DecorativeDivider />
      <StatsBar />
      <ServicesSection />
      <WhyUsSection />
      <GallerySection images={galleryImages} />
      <TeamSection />
      <TestimonialsSection />
      <BookingSection />
      <AboutSection />
      <ContactSection />
      <WhatsAppButton />
    </>
  );
}
