'use client';

import { useState } from 'react';
import type { Vertical } from '@prisma/client';
import {
  type AdminOrder,
  type OrderStatus,
  STATUS_ORDER,
  DELIVERY_MODE_LABELS,
  getStatusLabels,
  fmtPrice,
} from '@/components/admin/orderTypes';
import styles from './OrderDetailModal.module.css';

export interface OrderDetailModalProps {
  order: AdminOrder;
  vertical?: Vertical;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onSaveTracking: (id: string, trackingNumber: string) => void;
  onNotify: (id: string) => void;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.5 21a1.7 1.7 0 0 1-3 0" />
    </svg>
  );
}

export default function OrderDetailModal({
  order,
  vertical,
  onStatusChange,
  onSaveTracking,
  onNotify,
  onClose,
}: OrderDetailModalProps) {
  const [tracking, setTracking] = useState(order.trackingNumber ?? '');

  const isFoodMarket = vertical === 'FOOD_MARKET';
  const statusLabels = getStatusLabels(vertical ?? 'ECOMMERCE', order.deliveryMode);

  const customerName = order.customer?.name ?? order.guestName ?? 'Гість';
  const customerPhone = order.customer?.phone ?? order.guestPhone ?? '—';
  const customerEmail = order.customer?.email ?? order.guestEmail ?? '—';
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const dateStr = new Date(order.createdAt).toLocaleDateString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.head}>
          <h2 className={styles.title}>Замовлення {order.orderNumber}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрити">
            <CloseIcon />
          </button>
        </div>

        <div className={styles.body}>
          {/* Info grid */}
          <div className={styles.info}>
            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Дата</span>
              <span className={styles.infoValue}>{dateStr}</span>
            </div>

            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Покупець</span>
              <span className={styles.infoValue}>{customerName}</span>
              <span className={styles.infoSub}>{customerPhone}</span>
              <span className={styles.infoSub}>{customerEmail}</span>
            </div>

            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Доставка</span>
              <span className={styles.infoValue}>{DELIVERY_MODE_LABELS[order.deliveryMode]}</span>
              {isFoodMarket && order.deliveryZone ? (
                <>
                  <span className={styles.infoSub}>{order.deliveryZone.name}</span>
                  <span className={styles.infoSub}>
                    ~{order.deliveryZone.estimatedMin ?? 30}–{order.deliveryZone.estimatedMax ?? 60} хв
                  </span>
                  {order.deliveryFee > 0 && (
                    <span className={styles.infoSub}>
                      Вартість: {fmtPrice(order.deliveryFee, order.currency)}
                    </span>
                  )}
                </>
              ) : (
                order.deliveryAddress && (
                  <span className={styles.infoSub}>
                    {[order.deliveryAddress.city, order.deliveryAddress.address].filter(Boolean).join(', ')}
                  </span>
                )
              )}
            </div>

            <div className={styles.infoBlock}>
              <span className={styles.infoLabel}>Оплата</span>
              <span className={styles.infoValue}>{order.paymentMethod ?? '—'}</span>
              <span className={styles.infoSub}>{statusLabels[order.status]}</span>
            </div>
          </div>

          {/* Items */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Товари ({itemCount})</h3>
            <ul className={styles.items}>
              {order.items.map((it) => (
                <li key={it.id} className={styles.item}>
                  <span className={styles.itemImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.product?.image ?? '/placeholder-product.svg'} alt="" />
                  </span>
                  <span className={styles.itemName}>{it.product?.nameKey ?? 'Продукт'}</span>
                  <span className={styles.itemQty}>× {it.quantity}</span>
                  <span className={styles.itemPrice}>{fmtPrice(it.price * it.quantity, order.currency)}</span>
                </li>
              ))}
            </ul>
            <div className={styles.total}>
              <span>До сплати</span>
              <span className={styles.totalVal}>{fmtPrice(order.total, order.currency)}</span>
            </div>
          </div>

          {/* Status + Tracking */}
          <div className={styles.controls}>
            <label className={styles.control}>
              <span className={styles.controlLabel}>Статус</span>
              <select
                className={styles.select}
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </label>

            {!isFoodMarket && (
              <div className={styles.control}>
                <span className={styles.controlLabel}>Номер ТТН</span>
                <div className={styles.ttnRow}>
                  <input
                    className={styles.input}
                    type="text"
                    value={tracking}
                    placeholder="Введіть номер ТТН"
                    onChange={(e) => setTracking(e.target.value)}
                  />
                  <button type="button" className={styles.ttnSave} onClick={() => onSaveTracking(order.id, tracking)}>
                    Зберегти ТТН
                  </button>
                </div>
              </div>
            )}
          </div>

          {order.customerNote && (
            <div className={styles.noteBlock}>
              <span className={styles.noteLabel}>Коментар покупця</span>
              <span className={styles.noteText}>{order.customerNote}</span>
            </div>
          )}

          <button type="button" className={styles.notify} onClick={() => onNotify(order.id)}>
            <BellIcon />
            Надіслати повідомлення покупцю
          </button>
        </div>
      </div>
    </div>
  );
}
