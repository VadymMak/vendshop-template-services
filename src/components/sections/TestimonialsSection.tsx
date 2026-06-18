import { TESTIMONIALS } from '@/lib/constants';
import GoldDivider from '@/components/ui/GoldDivider';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function TestimonialsSection() {
  return (
    <section id="recenzie" className="testimonials">
      <ScrollReveal direction="up" className="section-header">
        <p className="section-label">Recenzie</p>
        <h2 className="section-title">Čo hovoria naši klienti</h2>
        <GoldDivider />
      </ScrollReveal>

      <div className="testimonials-grid">
        {TESTIMONIALS.map((testimonial, i) => (
          <ScrollReveal key={testimonial.author} direction="up" delay={i * 150}>
            <div className="testimonial-card">
              <div className="testimonial-stars">{'★'.repeat(testimonial.stars)}</div>
              <p className="testimonial-text">{testimonial.text}</p>
              <p className="testimonial-author">{testimonial.author}</p>
              <p className="testimonial-date">{testimonial.date}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
