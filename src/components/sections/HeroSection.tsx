import Image from 'next/image';
import { WHATSAPP_LINKS } from '@/lib/constants';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__inner">
        {/* LEFT — text */}
        <div className="hero__content">
          <p className="hero__tagline">
            <span className="hero__tagline-line" />
            Est. 2018 — Trenčín
          </p>

          <h1 className="hero__title">
            Umenie <em>klasického</em>
            <br />
            holičstva
          </h1>

          <p className="hero__subtitle">
            Prémiový barber studio v Trenčíne pre ženy aj mužov.
          </p>

          <div className="hero__buttons">
            <a href="#rezervacia" className="btn-primary">
              Rezervovať termín
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
            src="/hero-barbershop.webp"
            alt="Kate Barber Studio interior"
            fill
            className="hero__image"
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 42vw"
            quality={85}
          />
          <div className="hero__overlay" />
        </div>
      </div>
    </section>
  );
}
