export type DbPromoType = 'DISCOUNT' | 'PRODUCT_OF_DAY' | 'BANNER' | 'FREE_DELIVERY';
export type PromoStatus = 'active' | 'scheduled' | 'finished';

export const PROMO_DB_TYPES: DbPromoType[] = ['DISCOUNT', 'PRODUCT_OF_DAY', 'BANNER', 'FREE_DELIVERY'];

export interface PromoFormData {
  title: string;
  type: DbPromoType;
  discountPct: string;
  promoCode: string;
  description: string;
  startDate: string;
  endDate: string;
  showBanner: boolean;
}

export interface PromoItem {
  id: string;
  title: string;
  type: DbPromoType;
  discountPercent: number | null;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  active: boolean;
  status: PromoStatus;
}
