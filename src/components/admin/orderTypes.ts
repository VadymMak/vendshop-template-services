// Prisma-aligned order types for admin UI

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type DeliveryMode = 'SHIPPING' | 'COURIER' | 'PICKUP' | 'DINE_IN';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryMode: DeliveryMode;
  deliveryAddress: { city?: string; address?: string; zip?: string } | null;
  deliveryZone: { name: string; fee: number; estimatedMin?: number; estimatedMax?: number } | null;
  deliveryFee: number;
  trackingNumber: string | null;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;
  subtotal: number;
  total: number;
  currency: string;
  customerNote: string | null;
  internalNote: string | null;
  createdAt: string;
  customer: { name: string; email: string; phone: string | null } | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { nameKey: string; image: string | null } | null;
  }[];
}

export const STATUS_ORDER: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export const STATUS_LABELS_ECOMMERCE: Record<OrderStatus, string> = {
  PENDING: 'Новий',
  CONFIRMED: 'Підтверджений',
  PROCESSING: 'В обробці',
  SHIPPED: 'Відправлений',
  DELIVERED: 'Доставлений',
  CANCELLED: 'Скасований',
  REFUNDED: 'Повернення',
};

export const STATUS_LABELS_FOOD: Record<OrderStatus, string> = {
  PENDING: 'Новий',
  CONFIRMED: 'Підтверджений',
  PROCESSING: 'Збирається',
  SHIPPED: 'Доставляється',
  DELIVERED: 'Доставлений',
  CANCELLED: 'Скасований',
  REFUNDED: 'Повернення',
};

export const STATUS_LABELS_FOOD_PICKUP: Record<OrderStatus, string> = {
  PENDING: 'Новий',
  CONFIRMED: 'Підтверджений',
  PROCESSING: 'Пакується',
  SHIPPED: 'Готовий до видачі',
  DELIVERED: 'Видано',
  CANCELLED: 'Скасований',
  REFUNDED: 'Повернення',
};

export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  SHIPPING: 'Пошта',
  COURIER: 'Кур\'єр',
  PICKUP: 'Самовивіз',
  DINE_IN: 'В закладі',
};

export function getStatusLabels(
  vertical: string,
  deliveryMode?: DeliveryMode | null,
): Record<OrderStatus, string> {
  if (vertical === 'FOOD_MARKET') {
    return deliveryMode === 'PICKUP' ? STATUS_LABELS_FOOD_PICKUP : STATUS_LABELS_FOOD;
  }
  return STATUS_LABELS_ECOMMERCE;
}

export const fmtPrice = (amount: number, currency: string) => {
  if (currency === 'EUR') return `€${amount.toFixed(2)}`;
  return `${new Intl.NumberFormat('uk-UA').format(amount)} грн`;
};
