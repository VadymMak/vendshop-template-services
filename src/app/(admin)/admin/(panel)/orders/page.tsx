import { db } from '@/lib/db';
import OrdersClient from './OrdersClient';
import type { AdminOrder } from '@/components/admin/orderTypes';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

export default async function OrdersPage() {
  const store = await db.store.findUnique({
    where: { slug: STORE_SLUG },
    select: { id: true, vertical: true },
  });

  if (!store) return <p style={{ padding: '2rem' }}>Магазин не знайдено</p>;

  const dbOrders = await db.order.findMany({
    where: { storeId: store.id },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      deliveryZone: { select: { name: true, fee: true, estimatedMin: true, estimatedMax: true } },
      items: {
        include: { product: { select: { nameKey: true, image: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const orders: AdminOrder[] = dbOrders.map((o) => {
    const addr = (o.deliveryAddress ?? null) as { city?: string; address?: string; zip?: string } | null;
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status as AdminOrder['status'],
      deliveryMode: o.deliveryMode as AdminOrder['deliveryMode'],
      deliveryAddress: addr,
      deliveryZone: o.deliveryZone
        ? {
            name: o.deliveryZone.name,
            fee: o.deliveryZone.fee,
            estimatedMin: o.deliveryZone.estimatedMin,
            estimatedMax: o.deliveryZone.estimatedMax,
          }
        : null,
      deliveryFee: o.deliveryFee,
      trackingNumber: o.trackingNumber,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus as AdminOrder['paymentStatus'],
      subtotal: o.subtotal,
      total: o.total,
      currency: o.currency,
      customerNote: o.customerNote,
      internalNote: o.internalNote,
      createdAt: o.createdAt.toISOString(),
      customer: o.customer
        ? { name: o.customer.name ?? '', email: o.customer.email, phone: o.customer.phone }
        : null,
      guestName: o.guestName,
      guestEmail: o.guestEmail,
      guestPhone: o.guestPhone,
      items: o.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        price: i.price,
        product: i.product ? { nameKey: i.product.nameKey, image: i.product.image } : null,
      })),
    };
  });

  return <OrdersClient orders={orders} vertical={store.vertical} />;
}
