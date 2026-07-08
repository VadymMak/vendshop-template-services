import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';

interface Master {
  id: string;
  name: string;
  role: string;
  bio?: string | null;
  photo?: string | null;
}

interface TeamSectionProps {
  masters: Master[];
}

export default async function TeamSection({ masters }: TeamSectionProps) {
  const t = await getTranslations('team');

  if (!masters.length) return null;

  return (
    <section id="tim" className="team">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">{t('label')}</p>
        <h2 className="section-title">{t('title')}</h2>
        <GoldDivider />
        <p className="section-subtitle">{t('subtitle')}</p>
      </ScrollReveal>

      <div className="team-grid">
        {masters.map((member, i) => (
          <ScrollReveal key={member.id} direction="up" delay={i * 120}>
            <div className="team-card">
              <div className="team-photo-container">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="team-photo"
                    unoptimized={member.photo.startsWith('http')}
                  />
                ) : (
                  <div className="team-photo-placeholder" aria-label={member.name}>
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                )}
              </div>
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
              {member.bio && <p className="team-exp">{member.bio}</p>}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
