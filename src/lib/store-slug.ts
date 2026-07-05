export function getStoreSlug(): string {
  const slug = process.env.STORE_SLUG;
  if (!slug) throw new Error('STORE_SLUG environment variable is not set');
  return slug;
}
