export type PromoStatus = 'active' | 'scheduled' | 'finished';
export type PromoType = 'brand' | 'category' | 'promocode' | 'freeDelivery';

export const PROMO_TYPES: PromoType[] = ['brand', 'category', 'promocode', 'freeDelivery'];

export const PROMO_TYPE_LABEL: Record<PromoType, string> = {
  brand: 'Знижка на бренд',
  category: 'Знижка на категорію',
  promocode: 'Промокод',
  freeDelivery: 'Безкоштовна доставка',
};

export const PROMO_STATUS_LABEL: Record<PromoStatus, string> = {
  active: 'Активна',
  scheduled: 'Запланована',
  finished: 'Завершена',
};

export interface PromoFormData {
  title: string;
  type: PromoType;
  discount: string;
  target: string;
  startDate: string;
  endDate: string;
  announcement: string;
}
