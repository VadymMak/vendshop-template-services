import Link from 'next/link';
import TestimonialCard from '@/components/ui/TestimonialCard';

interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  createdAt: string;
  adminReply?: string | null;
  adminReplyAt?: string | null;
}

async function getTestimonials(): Promise<Testimonial[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/testimonials`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json() as { items: Testimonial[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : null;

  return (
    <main style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      <section className="testimonials-page__section">

        <div className="testimonials-list__header">
          <div>
            <span className="section-eyebrow">Recenzie</span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--color-text-primary)', marginTop: '0.5rem' }}>
              Čo hovoria naši klienti
            </h1>
            {avgRating && (
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                ⭐ {avgRating} · {testimonials.length} recenzií
              </p>
            )}
          </div>
          <Link href="/sk/testimonials/submit" className="btn-primary">
            Zanechať recenziu
          </Link>
        </div>

        {testimonials.length > 0 ? (
          <div className="testimonials-page__grid">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} {...t} />
            ))}
          </div>
        ) : (
          <div className="testimonials-page__empty">
            <p>Zatiaľ žiadne recenzie.</p>
            <Link
              href="/sk/testimonials/submit"
              className="btn-outline"
              style={{ marginTop: '1rem', display: 'inline-block' }}
            >
              Buďte prvý!
            </Link>
          </div>
        )}

      </section>
    </main>
  );
}
