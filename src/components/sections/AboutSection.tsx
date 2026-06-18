import Image from 'next/image';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function AboutSection() {
  return (
    <section id="o-nas" className="about">
      <div className="about__grid">
        <ScrollReveal direction="left">
          <div className="about__image-wrap">
            <Image
              src="/about-barbershop.webp"
              alt="Kate Barber Studio interiér"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="about__image"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={150}>
          <div>
            <p className="about__label">O nás</p>
            <h3 className="about__title">
              Tradícia stretáva
              <br />
              moderný štýl
            </h3>
            <p className="about__text">
              Kate Barber vznikol v roku 2018 z lásky k tradičnému holičstvu. Náš zakladateľ{' '}
              <strong>Marco Kate Barber</strong> priniesol do Trenčína to najlepšie z talianskej
              barberskej tradície.
            </p>
            <p className="about__text">
              Každý strih je pre nás umenie. Nerobíme rýchle strihy — venujeme sa každému klientovi
              individuálne, pretože veríme, že{' '}
              <strong>každý muž si zaslúži cítiť sa výnimočne</strong>.
            </p>
            <p className="about__text">
              Náš shop je miesto, kde sa zastavíte, oddýchnete si a odídete ako nový človek.
              Espresso na nás.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
