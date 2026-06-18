'use client';

import { useState, useEffect } from 'react';
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
        <p className="section-label">Naše služby</p>
        <h2 className="section-title">Čo pre vás pripravíme</h2>
        <GoldDivider />
        <p className="section-subtitle">
          Od klasického strihu po kompletný grooming — postaráme sa o vás od hlavy po bradu.
        </p>
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
                      <p className="service-card__duration">⏱ {s.duration} min</p>
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
