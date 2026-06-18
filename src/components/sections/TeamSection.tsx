import Image from 'next/image';
import { TEAM } from '@/lib/constants';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function TeamSection() {
  return (
    <section id="tim" className="team">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">Náš tím</p>
        <h2 className="section-title">Majstri svojho remesla</h2>
        <GoldDivider />
        <p className="section-subtitle">Každý z nás prináša unikátny štýl a roky skúseností.</p>
      </ScrollReveal>

      <div className="team-grid">
        {TEAM.map((member, i) => (
          <ScrollReveal key={member.name} direction="up" delay={i * 120}>
            <div className="team-card">
              <div className="team-photo-container">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="team-photo"
                />
              </div>
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-exp">{member.experience}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
