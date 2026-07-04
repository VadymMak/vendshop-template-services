import type { WhyUsItem } from '@/lib/types';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';

function getIcon(icon: string) {
  switch (icon) {
    case 'scissors':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      );
    case 'location':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'trend':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'click':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
        </svg>
      );
    case 'medal':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      );
    default:
      return null;
  }
}

function WhyUsCard({ item }: { item: WhyUsItem }) {
  return (
    <div className="why-us__card">
      <div className="why-us__icon">{getIcon(item.icon)}</div>
      <h3 className="why-us__card-title">{item.title}</h3>
      <p className="why-us__card-desc">{item.description}</p>
    </div>
  );
}

interface WhyUsSectionProps {
  city?: string;
  googleRating?: number;
  address?: string;
}

export default function WhyUsSection({ city, googleRating, address }: WhyUsSectionProps) {
  const locationDesc = address
    ? `Nájdeš nás na adrese ${address}, priamo v srdci ${city ?? 'mesta'}.`
    : city
      ? `Nájdeš nás v centre ${city}, priamo v srdci mesta.`
      : 'Nájdeš nás priamo v srdci mesta.';

  const ratingTitle = googleRating ? `${googleRating} na Google` : 'Výborné hodnotenie';

  const items: WhyUsItem[] = [
    { icon: 'scissors', title: 'Vieme, že si originál',   description: 'Nekopírujeme. Chceme vyzdvihnúť tvoju jedinečnosť.' },
    { icon: 'location', title: city ? `Sme v ${city}` : 'Sme v centre mesta', description: locationDesc },
    { icon: 'trend',    title: 'Sledujeme trendy',        description: 'Najnovšie strihy aj klasika v podaní profesionálnych barberov.' },
    { icon: 'star',     title: 'Sme profesionáli',        description: 'Každý barber v tíme má minimálne 3 roky skúseností.' },
    { icon: 'click',    title: 'Objednávka na 3 kliky',   description: 'WhatsApp alebo formulár — rezervácia za pár sekúnd.' },
    { icon: 'medal',    title: ratingTitle,               description: 'Stovky spokojných klientov. Prečítaj si recenzie.' },
  ];

  return (
    <section className="why-us">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">Prečo my</p>
        <h2 className="section-title">Čo nás robí výnimočnými</h2>
        <GoldDivider />
      </ScrollReveal>

      <div className="why-us__grid">
        {items.map((item, i) => (
          <ScrollReveal key={item.icon} direction="up" delay={i * 100}>
            <WhyUsCard item={item} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
