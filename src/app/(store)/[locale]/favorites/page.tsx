import { setRequestLocale } from 'next-intl/server';
import FavoritesClient from '@/components/favorites/FavoritesClient';

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FavoritesClient />;
}
