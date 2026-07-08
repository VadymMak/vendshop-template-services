'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';

interface Service {
  id: string;
  nameKey: string;
  description?: string | null;
  price: number;
  duration?: number | null;
  category?: string | null;
}

export default function ServicesSection() {
  const t = useTranslations('services');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((d: { services?: Service[] }) => {
        setServices(d.services ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section id="sluzby" className="services">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">{t('title')}</p>
        <h2 className="section-title">{t('subtitle')}</h2>
        <GoldDivider />
        <p className="section-subtitle">{t('description')}</p>
      </ScrollReveal>

      <div className="services__grid">
        {loading
          ? [0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="service-card service-card--skeleton" />
            ))
          : services.map((s, i) => (
              <ScrollReveal key={s.id} direction="scale" delay={i * 100}>
                <div className="service-card">
                  <div>
                    <h3 className="service-card__name">{s.nameKey}</h3>
                    {s.description && (
                      <p className="service-card__desc">{s.description}</p>
                    )}
                    {s.duration && (
                      <p className="service-card__duration">⏱ {s.duration} {t('minutes')}</p>
                    )}
                  </div>
                  <div className="service-card__price">€{s.price}</div>
                </div>
              </ScrollReveal>
            ))}
      </div>
    </section>
  );
}
