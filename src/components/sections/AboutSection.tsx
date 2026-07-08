import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import ScrollReveal from '@/components/ui/ScrollReveal';

interface AboutSectionProps {
  storeName?: string;
  founderName?: string;
  city?: string;
  /** Uploaded via admin panel → Vercel Blob URL. If null — shows CSS placeholder. */
  aboutImage?: string | null;
  /** Custom description from DB. If null — falls back to i18n keys. */
  description?: string | null;
}

export default async function AboutSection({
  storeName,
  founderName,
  city,
  aboutImage,
  description,
}: AboutSectionProps) {
  const tAbout = await getTranslations('about');
  const displayCity = city ?? tAbout('cityFallback');

  return (
    <section id="o-nas" className="about">
      <div className="about__grid">
        <ScrollReveal direction="left">
          <div className="about__image-wrap">
            {aboutImage ? (
              <Image
                src={aboutImage}
                alt={storeName ? `${storeName} — ${tAbout('imageAlt')}` : tAbout('imageAlt')}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="about__image"
                unoptimized={aboutImage.startsWith('http')}
              />
            ) : (
              <div className="about__image-placeholder" aria-label={tAbout('imageAlt')} />
            )}
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
            {description ? (
              <p className="about__text">{description}</p>
            ) : (
              <>
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
              </>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
