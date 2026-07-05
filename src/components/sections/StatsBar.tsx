import { getTranslations } from 'next-intl/server';
import ScrollReveal from '@/components/ui/ScrollReveal';

interface StatItem { number: string; label: string; }

interface StatsBarProps {
  googleRating?: number;
}

export default async function StatsBar({ googleRating }: StatsBarProps) {
  const t = await getTranslations('stats');

  const stats: StatItem[] = [
    { number: '7+',   label: t('yearsLabel')   },
    { number: '12K+', label: t('clientsLabel') },
    { number: '4',    label: t('barbersLabel') },
    { number: googleRating ? String(googleRating) : '4.9', label: t('googleLabel') },
  ];

  return (
    <ScrollReveal direction="up">
      <div className="stats-bar">
        <div className="stats-bar__grid">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="stats-bar__number">{stat.number}</div>
              <div className="stats-bar__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
