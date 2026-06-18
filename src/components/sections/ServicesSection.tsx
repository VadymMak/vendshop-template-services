import { SERVICES } from '@/lib/constants';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function ServicesSection() {
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
        {SERVICES.map((service, i) => (
          <ScrollReveal key={service.name} direction="scale" delay={i * 100}>
            <div className="service-card">
              <div>
                <h3 className="service-card__name">{service.name}</h3>
                <p className="service-card__desc">{service.description}</p>
              </div>
              <div className="service-card__price">{service.price}</div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
