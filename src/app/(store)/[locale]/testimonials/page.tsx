import Link from 'next/link';
import { db } from '@/lib/db';
import TestimonialCard from '@/components/ui/TestimonialCard';

async function getTestimonials() {
  try {
    const storeSlug = process.env.STORE_SLUG ?? 'kate-barber';
    const store = await db.store.findUnique({ where: { slug: storeSlug } });
    if (!store) {
      console.error('[testimonials] Store not found:', storeSlug);
      return [];
    }
    const results = await db.testimonial.findMany({
      where: { storeId: store.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } } },
    });
    return results;
  } catch (err) {
    console.error('[testimonials] DB error:', err);
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
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--color-text-primary)',
              marginTop: '0.5rem',
            }}>
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
              <TestimonialCard
                key={t.id}
                name={t.customer.name ?? 'Klient'}
                content={t.text}
                rating={t.rating}
                createdAt={t.createdAt.toISOString()}
                adminReply={t.adminReply}
                adminReplyAt={t.adminReplyAt?.toISOString() ?? null}
              />
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
