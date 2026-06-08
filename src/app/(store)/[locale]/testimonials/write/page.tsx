import { setRequestLocale } from 'next-intl/server';
import WriteTestimonialForm from './WriteTestimonialForm';

export default async function WriteTestimonialPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WriteTestimonialForm />;
}
