import Image from 'next/image';
import { WHATSAPP_LINKS, CONTACT } from '@/lib/constants';
import { formatHoursDisplay } from '@/lib/formatHours';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { BLUR_PLACEHOLDER } from '@/components/ui/BlurImage';

interface HeroConfig {
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  imageUrl?: string | null;
}

interface HeroSectionProps {
  config?: HeroConfig | null;
  city?: string;
  workingHours?: unknown;
  instagramUrl?: string;
}

const DEFAULTS = {
  title: 'Umenie klasického holičstva',
  subtitle: 'Prémiový barber studio v Trenčíne pre ženy aj mužov.',
  ctaText: 'Rezervovať termín',
  imageUrl: '/hero-barbershop.webp',
};

export default function HeroSection({ config, city, workingHours, instagramUrl }: HeroSectionProps) {
  const title    = config?.title    || DEFAULTS.title;
  const subtitle = config?.subtitle || DEFAULTS.subtitle;
  const ctaText  = config?.ctaText  || DEFAULTS.ctaText;
  const imageSrc = config?.imageUrl || DEFAULTS.imageUrl;

  const hoursText = formatHoursDisplay(workingHours);
  const cityText  = city || CONTACT.city;
  const igUrl     = instagramUrl || CONTACT.instagram;

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

          {/* Service chips */}
          <div className="hero__chips">
            <span className="hero__chip">✂ Strih</span>
            <span className="hero__chip">🧔 Brada</span>
            <span className="hero__chip">💈 Holenie</span>
            <span className="hero__chip">🎓 Kurzy</span>
          </div>

          {/* Price anchor */}
          <p className="hero__price-anchor">
            Strih od <strong>€15</strong> · Brada od <strong>€10</strong>
          </p>

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
            ⭐ Google 4.9
            {hoursText && <>&nbsp;·&nbsp; 🕐 {hoursText}</>}
            {cityText  && <>&nbsp;·&nbsp; 📍 {cityText}</>}
            {igUrl && (
              <>&nbsp;·&nbsp;{' '}
                <a href={igUrl} target="_blank" rel="noopener noreferrer" className="hero__instagram" aria-label="Instagram">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ display: 'inline', verticalAlign: 'middle', marginTop: '-2px' }}
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </>
            )}
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
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
          <div className="hero__overlay" />
        </div>
      </div>
    </section>
  );
}
