import { setRequestLocale } from 'next-intl/server';
import { db } from '@/lib/db';
import { getStoreConfig } from '@/lib/store-config';
import type { Locale } from '@/i18n/routing';

export const revalidate = 60;

const STORE_SLUG = process.env.STORE_SLUG ?? '';
const FALLBACK_LOCALE = 'sk';

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  CZK: 'Kč',
  UAH: '₴',
};

const WA_MESSAGES: Record<string, (name: string, price: number, currency: string) => string> = {
  sk: (n, p, c) => `Záujem o produkt: ${n} (${p} ${c})`,
  en: (n, p, c) => `Interested in product: ${n} (${p} ${c})`,
  uk: (n, p, c) => `Цікавить продукт: ${n} (${p} ${c})`,
  cs: (n, p, c) => `Zájem o produkt: ${n} (${p} ${c})`,
  de: (n, p, c) => `Interesse an: ${n} (${p} ${c})`,
};

const PAGE_LABELS: Record<string, { title: string; subtitle: string; buy: string; empty: string }> = {
  sk: { title: 'Digitálne produkty', subtitle: 'Príručky, návody a exkluzívny obsah', buy: 'Kúpiť cez WhatsApp', empty: 'Zatiaľ žiadne produkty' },
  en: { title: 'Digital Products', subtitle: 'Guides, tutorials and exclusive content', buy: 'Buy via WhatsApp', empty: 'No products yet' },
  uk: { title: 'Цифрові продукти', subtitle: 'Гайди, посібники та ексклюзивний контент', buy: 'Купити через WhatsApp', empty: 'Поки що немає продуктів' },
  cs: { title: 'Digitální produkty', subtitle: 'Příručky, návody a exkluzivní obsah', buy: 'Koupit přes WhatsApp', empty: 'Zatím žádné produkty' },
  de: { title: 'Digitale Produkte', subtitle: 'Leitfäden, Tutorials und exklusiver Inhalt', buy: 'Per WhatsApp kaufen', empty: 'Noch keine Produkte' },
};

export default async function DigitalProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const effectiveLocale = locale in PAGE_LABELS ? locale : FALLBACK_LOCALE;
  const labels = PAGE_LABELS[effectiveLocale];

  const config = await getStoreConfig();
  const whatsappNumber = config.presence.whatsapp ?? config.presence.phone ?? '';

  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { id: true },
  });

  const products = store
    ? await db.digitalProduct.findMany({
        where: { storeId: store.id, active: true },
        include: {
          translations: {
            where: { locale: { in: [effectiveLocale, FALLBACK_LOCALE] } },
          },
        },
        orderBy: { sortOrder: 'asc' },
      })
    : [];

  const items = products.map((p) => {
    const t =
      p.translations.find((tr) => tr.locale === effectiveLocale) ??
      p.translations.find((tr) => tr.locale === FALLBACK_LOCALE);
    return {
      id: p.id,
      slug: p.slug,
      price: p.price,
      currency: p.currency,
      previewUrl: p.previewUrl,
      name: t?.name ?? p.slug,
      description: t?.description ?? null,
    };
  });

  return (
    <section style={{ padding: 'var(--spacing-lg, 4rem) var(--spacing-sm, 1rem)', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md, 2rem)' }}>
        <p style={{ color: 'var(--color-copper, #B87333)', fontSize: 'var(--font-size-sm, 0.875rem)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          {config.name}
        </p>
        <h1 style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-2xl, 2rem)', marginBottom: '0.5rem' }}>
          {labels.title}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-md, 1rem)' }}>
          {labels.subtitle}
        </p>
      </div>

      {items.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem 0' }}>
          {labels.empty}
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--spacing-sm, 1rem)',
        }}>
          {items.map((item) => {
            const symbol = CURRENCY_SYMBOLS[item.currency] ?? item.currency;
            const waMsg = (WA_MESSAGES[effectiveLocale] ?? WA_MESSAGES.sk)(item.name, item.price, item.currency);
            const waUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMsg)}` : '#';

            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-lg, 8px)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '200px', background: 'var(--color-bg-secondary, #0D1A24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2.5rem' }}>📄</span>
                  </div>
                )}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-lg, 1.25rem)', margin: 0 }}>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm, 0.875rem)', margin: 0, flex: 1 }}>
                      {item.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem' }}>
                    <span style={{ color: 'var(--color-copper, #B87333)', fontSize: 'var(--font-size-xl, 1.5rem)', fontWeight: 700 }}>
                      {symbol}{item.price}
                    </span>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ fontSize: 'var(--font-size-sm, 0.875rem)', padding: '0.5rem 1rem', textDecoration: 'none' }}
                    >
                      {labels.buy}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
