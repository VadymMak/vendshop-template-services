'use client';

import { useMemo, useState } from 'react';
import OrderDetailModal from '@/components/admin/OrderDetailModal/OrderDetailModal';
import TtnModal from '@/components/admin/TtnModal/TtnModal';
import {
  type AdminOrder,
  type OrderStatus,
  STATUS_ORDER,
  STATUS_LABEL,
  PAYMENT_LABEL,
  orderTotal,
  orderCount,
} from '@/components/admin/orderTypes';
import styles from './orders.module.css';

const P = '/placeholder-product.svg';

const INITIAL_ORDERS: AdminOrder[] = [
  { id: '1042', customer: 'Іван Петренко', phone: '+380 97 123 45 67', email: 'ivan.petrenko@gmail.com', payment: 'wayforpay', status: 'new', date: '31.05.2026', delivery: { method: 'Нова Пошта — відділення', city: 'Київ', address: 'Відділення №12' }, items: [{ name: 'Дриль-шурупокрут Makita DF333DSAE', qty: 1, price: 2990, image: P }, { name: 'Перфоратор Bosch GBH 2-26 DRE', qty: 1, price: 5749, image: P }] },
  { id: '1041', customer: 'Олена Коваль', phone: '+380 50 234 56 78', email: 'olena.k@ukr.net', payment: 'liqpay', status: 'processing', date: '31.05.2026', delivery: { method: "Нова Пошта — кур'єр", city: 'Львів', address: 'вул. Городоцька, 15' }, items: [{ name: 'Перфоратор Bosch GBH 2-26 DRE', qty: 1, price: 5749, image: P }] },
  { id: '1040', customer: 'Андрій Шевченко', phone: '+380 63 345 67 89', email: 'a.shevchenko@gmail.com', payment: 'cod', status: 'shipped', date: '30.05.2026', delivery: { method: 'Нова Пошта — відділення', city: 'Одеса', address: 'Відділення №5' }, ttn: '20450012345678', items: [{ name: 'Кутова шліфмашина DeWalt DWE4157', qty: 1, price: 3199, image: P }, { name: 'Дриль ударна DeWalt DWD024', qty: 1, price: 2450, image: P }] },
  { id: '1039', customer: 'Марія Бондар', phone: '+380 67 456 78 90', email: 'maria.bondar@gmail.com', payment: 'wayforpay', status: 'delivered', date: '30.05.2026', delivery: { method: 'Самовивіз з магазину', city: 'Київ', address: 'вул. Хрещатик, 1' }, items: [{ name: 'Гайковерт ударний Milwaukee M18 FIW2F12', qty: 1, price: 8999, image: P }, { name: 'Лобзик Metabo STEB 65 Quick', qty: 1, price: 4290, image: P }] },
  { id: '1038', customer: 'Сергій Ткаченко', phone: '+380 98 567 89 01', email: 'serhii.t@ukr.net', payment: 'liqpay', status: 'delivered', date: '29.05.2026', delivery: { method: 'Нова Пошта — відділення', city: 'Харків', address: 'Відділення №24' }, items: [{ name: 'Дриль-шурупокрут Makita DF333DSAE', qty: 1, price: 2990, image: P }] },
  { id: '1037', customer: 'Наталія Мороз', phone: '+380 95 678 90 12', email: 'nataliia.moroz@gmail.com', payment: 'cod', status: 'cancelled', date: '28.05.2026', delivery: { method: "Нова Пошта — кур'єр", city: 'Дніпро', address: 'просп. Яворницького, 30' }, items: [{ name: 'Болгарка Milwaukee M18 FSAG125XB', qty: 1, price: 7990, image: P }] },
  { id: '1036', customer: 'Дмитро Кравець', phone: '+380 73 789 01 23', email: 'd.kravets@gmail.com', payment: 'wayforpay', status: 'processing', date: '28.05.2026', delivery: { method: 'Нова Пошта — відділення', city: 'Київ', address: 'Відділення №3' }, items: [{ name: 'Шліфмашина ексцентрикова Bosch GEX 40-150', qty: 1, price: 6290, image: P }, { name: 'Перфоратор Makita HR2470 SDS-Plus', qty: 1, price: 4599, image: P }] },
  { id: '1035', customer: 'Юлія Лисенко', phone: '+380 66 890 12 34', email: 'yuliia.l@ukr.net', payment: 'liqpay', status: 'new', date: '27.05.2026', delivery: { method: 'Нова Пошта — відділення', city: 'Запоріжжя', address: 'Відділення №8' }, items: [{ name: 'Лобзик Metabo STEB 65 Quick', qty: 1, price: 4290, image: P }] },
];

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);

type StatFilter = 'all' | OrderStatus;
const STAT_FILTERS: { key: StatFilter; label: string }[] = [
  { key: 'all', label: 'Всі' },
  { key: 'new', label: 'Нові' },
  { key: 'processing', label: 'Обробляються' },
  { key: 'shipped', label: 'Відправлено' },
  { key: 'delivered', label: 'Доставлено' },
];

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>;
}
function ExportIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></svg>;
}
function EyeIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function BoxIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [statusFilter, setStatusFilter] = useState<StatFilter>('all');
  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [ttnId, setTtnId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<StatFilter, number> = { all: orders.length, new: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    for (const o of orders) c[o.status] += 1;
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (q && !o.customer.toLowerCase().includes(q) && !o.phone.toLowerCase().includes(q) && !o.id.includes(q.replace('#', ''))) return false;
      return true;
    });
  }, [orders, statusFilter, search]);

  const changeStatus = (id: string, status: OrderStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  const saveTtn = (id: string, ttn: string) => {
    console.log('[admin order TTN]', { id, ttn });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ttn } : o)));
    setTtnId(null);
  };
  const notify = (id: string) => console.log('[admin order notify customer]', { id });
  const exportExcel = () => console.log('[admin orders export]', filtered.map((o) => o.id));

  const detailOrder = orders.find((o) => o.id === detailId) ?? null;
  const ttnOrder = orders.find((o) => o.id === ttnId) ?? null;

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1 className={styles.h1}>Замовлення</h1>
        <button type="button" className={styles.exportBtn} onClick={exportExcel}>
          <ExportIcon />
          Експорт Excel
        </button>
      </div>

      {/* Stat filter badges */}
      <div className={styles.stats}>
        {STAT_FILTERS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`${styles.stat} ${statusFilter === s.key ? styles.statActive : ''}`}
            onClick={() => setStatusFilter(s.key)}
          >
            {s.label} <span className={styles.statCount}>({counts[s.key]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <SearchIcon />
        <input
          className={styles.search}
          type="search"
          placeholder="Пошук по імені, телефону, №..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№ замовлення</th>
              <th>Покупець</th>
              <th>Товари</th>
              <th>Сума</th>
              <th>Оплата</th>
              <th>Статус</th>
              <th>Дата</th>
              <th className={styles.colActions}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>
                  <button type="button" className={styles.orderId} onClick={() => setDetailId(o.id)}>
                    #{o.id}
                  </button>
                </td>
                <td>
                  <span className={styles.customer}>{o.customer}</span>
                  <span className={styles.phone}>{o.phone}</span>
                </td>
                <td className={styles.items}>{orderCount(o)} товари</td>
                <td className={styles.sum}>{fmt(orderTotal(o))} грн</td>
                <td className={styles.payment}>{PAYMENT_LABEL[o.payment]}</td>
                <td>
                  <select
                    className={`${styles.statusSelect} ${styles[o.status]}`}
                    value={o.status}
                    onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={styles.date}>{o.date}</td>
                <td>
                  <div className={styles.actions}>
                    <button type="button" className={styles.iconBtn} onClick={() => setDetailId(o.id)} aria-label="Переглянути">
                      <EyeIcon />
                    </button>
                    <button type="button" className={styles.iconBtn} onClick={() => setTtnId(o.id)} aria-label="ТТН">
                      <BoxIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.emptyRow}>Замовлень не знайдено</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onStatusChange={changeStatus}
          onSaveTtn={saveTtn}
          onNotify={notify}
          onClose={() => setDetailId(null)}
        />
      )}

      {ttnOrder && (
        <TtnModal
          orderId={ttnOrder.id}
          initialTtn={ttnOrder.ttn}
          onSave={saveTtn}
          onClose={() => setTtnId(null)}
        />
      )}
    </div>
  );
}
