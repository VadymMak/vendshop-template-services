import { setRequestLocale } from 'next-intl/server';
import CompareClient from '@/components/compare/CompareClient';

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CompareClient />;
}
