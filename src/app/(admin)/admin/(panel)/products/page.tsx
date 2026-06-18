import { db } from '@/lib/db';
import AdminDigitalProductsClient from './AdminProductsClient';

const STORE_SLUG = process.env.STORE_SLUG ?? 'kate-barber';

export default async function AdminProductsPage() {
  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { id: true, vertical: true },
  });

  if (!store) {
    return <p style={{ padding: '2rem' }}>Obchod «{STORE_SLUG}» nebol nájdený</p>;
  }

  const products = await db.digitalProduct.findMany({
    where: { storeId: store.id },
    include: { translations: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <AdminDigitalProductsClient
      initialProducts={products.map((p) => ({
        id: p.id,
        slug: p.slug,
        price: p.price,
        currency: p.currency,
        previewUrl: p.previewUrl,
        fileUrl: p.fileUrl,
        active: p.active,
        sortOrder: p.sortOrder,
        translations: p.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          description: t.description ?? '',
        })),
      }))}
    />
  );
}
