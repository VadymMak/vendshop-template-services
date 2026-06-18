import Image from 'next/image';
import { WHATSAPP_LINKS } from '@/lib/constants';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

interface HeroConfig {
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  imageUrl?: string | null;
}

interface HeroSectionProps {
  config?: HeroConfig | null;
}

const DEFAULTS = {
  title: 'Umenie klasického holičstva',
  subtitle: 'Prémiový barber studio v Trenčíne pre ženy aj mužov.',
  ctaText: 'Rezervovať termín',
  imageUrl: '/hero-barbershop.webp',
};

export default function HeroSection({ config }: HeroSectionProps) {
  const title = config?.title || DEFAULTS.title;
  const subtitle = config?.subtitle || DEFAULTS.subtitle;
  const ctaText = config?.ctaText || DEFAULTS.ctaText;
  const imageSrc = config?.imageUrl || DEFAULTS.imageUrl;

  return (
    <section className="hero">
      <div className="hero__inner">
        {/* LEFT — text */}
        <div className="hero__content">
          <p className="hero__tagline">
            <span className="hero__tagline-line" />
            Est. 2018 — Trenčín
          </p>

          <h1 className="hero__title">{title}</h1>

          <p className="hero__subtitle">{subtitle}</p>

          <div className="hero__buttons">
            <a href="#rezervacia" className="btn-primary">
              {ctaText}
            </a>
            <a
              href={WHATSAPP_LINKS.booking}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <WhatsAppIcon size={18} />
              WhatsApp
            </a>
          </div>

          <p className="hero__trust">
            ⭐ Google 4.9 &nbsp;·&nbsp; 🕐 Po–Pia 09:00–19:00 &nbsp;·&nbsp; 📍 Trenčín
          </p>
        </div>

        {/* RIGHT — image */}
        <div className="hero__image-wrap">
          <Image
            src={imageSrc}
            alt="Kate Barber Studio interior"
            fill
            className="hero__image"
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 42vw"
            quality={85}
            unoptimized={imageSrc.startsWith('http')}
          />
          <div className="hero__overlay" />
        </div>
      </div>
    </section>
  );
}
