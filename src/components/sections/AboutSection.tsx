import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import ScrollReveal from '@/components/ui/ScrollReveal';

interface AboutSectionProps {
  storeName?: string;
  founderName?: string;
  city?: string;
}

export default async function AboutSection({ storeName, founderName, city }: AboutSectionProps) {
  const tAbout = await getTranslations('about');
  const displayCity = city ?? 'nášho mesta';

  return (
    <section id="o-nas" className="about">
      <div className="about__grid">
        <ScrollReveal direction="left">
          <div className="about__image-wrap">
            <Image
              src="/about-barbershop.webp"
              alt={storeName ? `${storeName} — ${tAbout('imageAlt')}` : tAbout('imageAlt')}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="about__image"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={150}>
          <div>
            <p className="about__label">{tAbout('label')}</p>
            <h3 className="about__title">
              {tAbout('title').split(' ').slice(0, 2).join(' ')}
              <br />
              {tAbout('title').split(' ').slice(2).join(' ')}
            </h3>
            <p className="about__text">
              {tAbout('text1', { name: storeName ?? '' })}
              {founderName && (
                <> {tAbout('text1Founder', { founderName, city: displayCity })}</>
              )}
              {!founderName && (
                <> {tAbout('text1NoFounder', { city: displayCity })}</>
              )}
            </p>
            <p className="about__text">
              {tAbout('text2Pre')} <strong>{tAbout('text2Em')}</strong>.
            </p>
            <p className="about__text">
              {tAbout('text3')}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
