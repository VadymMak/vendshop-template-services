import ScrollReveal from '@/components/ui/ScrollReveal';

interface StatItem { number: string; label: string; }

interface StatsBarProps {
  googleRating?: number;
}

const BASE_STATS: StatItem[] = [
  { number: '7+',   label: 'Rokov skúseností'    },
  { number: '12K+', label: 'Spokojných klientov'  },
  { number: '4',    label: 'Profesionálni barberi' },
];

export default function StatsBar({ googleRating }: StatsBarProps) {
  const stats: StatItem[] = [
    ...BASE_STATS,
    { number: googleRating ? String(googleRating) : '4.9', label: 'Google hodnotenie' },
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
