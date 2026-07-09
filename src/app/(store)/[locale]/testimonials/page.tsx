import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import TestimonialCard from '@/components/ui/TestimonialCard';

async function getTestimonials() {
  try {
    const storeSlug = process.env.STORE_SLUG ?? '';
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

export default async function TestimonialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('testimonials');
  const testimonials = await getTestimonials();

  const avgRating = testimonials.length
    ? (testimonials.reduce((s, tst) => s + tst.rating, 0) / testimonials.length).toFixed(1)
    : null;

  return (
    <main style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      <section className="testimonials-page__section">

        <div className="testimonials-list__header">
          <div>
            <span className="section-eyebrow">{t('pageTitle')}</span>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--color-text)',
              marginTop: '0.5rem',
            }}>
              {t('sectionTitle')}
            </h1>
            {avgRating && (
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                ⭐ {avgRating} · {testimonials.length} {t('reviews')}
              </p>
            )}
          </div>
          <Link href={`/${locale}/testimonials/submit`} className="btn-primary">
            {t('writeReview')}
          </Link>
        </div>

        {testimonials.length > 0 ? (
          <div className="testimonials-page__grid">
            {testimonials.map((tst) => (
              <TestimonialCard
                key={tst.id}
                name={tst.authorName ?? tst.customer?.name ?? 'Anonym'}
                content={tst.text}
                rating={tst.rating}
                createdAt={tst.createdAt.toISOString()}
                adminReply={tst.adminReply}
                adminReplyAt={tst.adminReplyAt?.toISOString() ?? null}
              />
            ))}
          </div>
        ) : (
          <div className="testimonials-page__empty">
            <p>{t('noReviews')}</p>
            <Link
              href={`/${locale}/testimonials/submit`}
              className="btn-outline"
              style={{ marginTop: '1rem', display: 'inline-block' }}
            >
              {t('writeReview')}
            </Link>
          </div>
        )}

      </section>
    </main>
  );
}
