import { STATS } from '@/lib/constants';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function StatsBar() {
  return (
    <ScrollReveal direction="up">
      <div className="stats-bar">
        <div className="stats-bar__grid">
          {STATS.map((stat) => (
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
