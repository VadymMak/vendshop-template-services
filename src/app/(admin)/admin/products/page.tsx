'use client';

import { useMemo, useState } from 'react';
import ProductModal, {
  type ProductFormData,
} from '@/components/admin/ProductModal/ProductModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog/ConfirmDialog';
import styles from './products.module.css';

interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  categorySlug: string;
  brand: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  image: string;
}

const CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'drills', label: 'Дрелі' },
  { slug: 'grinders', label: 'Болгарки' },
  { slug: 'perforators', label: 'Перфоратори' },
  { slug: 'jigsaws', label: 'Лобзики' },
  { slug: 'sanders', label: 'Шліфмашини' },
];

const BRANDS = ['MAKITA', 'BOSCH', 'DEWALT', 'MILWAUKEE', 'METABO'];
const PLACEHOLDER = '/placeholder-product.svg';
const PAGE_SIZE = 6;

const INITIAL_PRODUCTS: AdminProduct[] = [
  { id: 'c1', name: 'Дриль-шурупокрут Makita DF333DSAE 12V', sku: 'DF333DSAE', categorySlug: 'drills', brand: 'MAKITA', price: 2990, oldPrice: 3499, inStock: true, image: PLACEHOLDER },
  { id: 'c2', name: 'Кутова шліфмашина DeWalt DWE4157 900 Вт', sku: 'DWE4157', categorySlug: 'grinders', brand: 'DEWALT', price: 3199, oldPrice: 4099, inStock: true, image: PLACEHOLDER },
  { id: 'c3', name: 'Перфоратор Bosch GBH 2-26 DRE Professional', sku: 'GBH226DRE', categorySlug: 'perforators', brand: 'BOSCH', price: 5749, inStock: true, image: PLACEHOLDER },
  { id: 'c4', name: 'Гайковерт ударний Milwaukee M18 FIW2F12', sku: 'FIW2F12', categorySlug: 'drills', brand: 'MILWAUKEE', price: 8999, oldPrice: 10999, inStock: true, image: PLACEHOLDER },
  { id: 'c5', name: 'Лобзик Metabo STEB 65 Quick 450 Вт', sku: 'STEB65', categorySlug: 'jigsaws', brand: 'METABO', price: 4290, inStock: true, image: PLACEHOLDER },
  { id: 'c6', name: 'Перфоратор Makita HR2470 780 Вт SDS-Plus', sku: 'HR2470', categorySlug: 'perforators', brand: 'MAKITA', price: 4599, oldPrice: 5250, inStock: true, image: PLACEHOLDER },
  { id: 'c7', name: 'Шліфмашина ексцентрикова Bosch GEX 40-150', sku: 'GEX40150', categorySlug: 'sanders', brand: 'BOSCH', price: 6290, oldPrice: 8990, inStock: true, image: PLACEHOLDER },
  { id: 'c8', name: 'Дриль ударна DeWalt DWD024 701 Вт', sku: 'DWD024', categorySlug: 'drills', brand: 'DEWALT', price: 2450, inStock: false, image: PLACEHOLDER },
  { id: 'c9', name: 'Болгарка Milwaukee M18 FSAG125XB 125 мм', sku: 'FSAG125XB', categorySlug: 'grinders', brand: 'MILWAUKEE', price: 7990, oldPrice: 10650, inStock: true, image: PLACEHOLDER },
];

const fmt = (n: number) => new Intl.NumberFormat('uk-UA').format(n);
const catLabel = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>;
}
function PlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
}
function EditIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>;
}
function TrashIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6m2.5 0-.7 13a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5.5 6" /><path d="M10 11v5M14 11v5" /></svg>;
}
function CheckMini() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;
}
function ArrowL() {
  return <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>;
}
function ArrowR() {
  return <svg width="15" height="15" viewBox="0 0 24 24" {...stroke} aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;
}

type ModalState = { mode: 'add' } | { mode: 'edit'; id: string } | null;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      if (categoryFilter !== 'all' && p.categorySlug !== categoryFilter) return false;
      if (brandFilter !== 'all' && p.brand !== brandFilter) return false;
      if (inStockOnly && !p.inStock) return false;
      return true;
    });
  }, [products, search, categoryFilter, brandFilter, inStockOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleCheck = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allFilteredChecked = filtered.length > 0 && filtered.every((p) => checked.has(p.id));
  const toggleAll = () =>
    setChecked(allFilteredChecked ? new Set() : new Set(filtered.map((p) => p.id)));

  const toggleStock = (id: string) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p)));

  const deleteSelected = () => {
    setProducts((prev) => prev.filter((p) => !checked.has(p.id)));
    setChecked(new Set());
  };

  const doDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setChecked((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDeletingId(null);
  };

  const handleSave = (data: ProductFormData) => {
    console.log('[admin product save]', data);
    const price = Number(data.price) || 0;
    const oldPrice = data.oldPrice ? Number(data.oldPrice) : undefined;
    if (modal?.mode === 'edit') {
      const id = modal.id;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, name: data.name, brand: data.brand, categorySlug: data.category, price, oldPrice, inStock: data.inStock }
            : p,
        ),
      );
    } else {
      setProducts((prev) => [
        {
          id: `new-${Date.now()}`,
          name: data.name,
          sku: `NEW-${String(Date.now()).slice(-5)}`,
          categorySlug: data.category,
          brand: data.brand,
          price,
          oldPrice,
          inStock: data.inStock,
          image: PLACEHOLDER,
        },
        ...prev,
      ]);
    }
    setModal(null);
  };

  const editing = modal?.mode === 'edit' ? products.find((p) => p.id === modal.id) : undefined;
  const modalInitial: ProductFormData = editing
    ? {
        name: editing.name,
        brand: editing.brand,
        category: editing.categorySlug,
        price: String(editing.price),
        oldPrice: editing.oldPrice != null ? String(editing.oldPrice) : '',
        inStock: editing.inStock,
      }
    : { name: '', brand: BRANDS[0], category: CATEGORIES[0].slug, price: '', oldPrice: '', inStock: true };

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1 className={styles.h1}>Товари</h1>
        <button type="button" className={styles.addBtn} onClick={() => setModal({ mode: 'add' })}>
          <PlusIcon />
          Додати товар
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <SearchIcon />
        <input
          className={styles.search}
          type="search"
          placeholder="Пошук товарів..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          className={styles.select}
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
        >
          <option value="all">Всі категорії</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={brandFilter}
          onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
        >
          <option value="all">Всі бренди</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <label className={styles.toggleFilter}>
          <span className={styles.toggle}>
            <input type="checkbox" checked={inStockOnly} onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }} />
            <span className={styles.track} />
          </span>
          В наявності
        </label>
      </div>

      {/* Bulk bar */}
      {checked.size > 0 && (
        <div className={styles.bulk}>
          <span>Вибрано {checked.size} товарів</span>
          <button type="button" className={styles.bulkDelete} onClick={deleteSelected}>
            <TrashIcon />
            Видалити вибрані
          </button>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colChk}>
                <span className={styles.chk}>
                  <input type="checkbox" checked={allFilteredChecked} onChange={toggleAll} aria-label="Вибрати всі" />
                  <span className={styles.chkBox}><CheckMini /></span>
                </span>
              </th>
              <th>Фото</th>
              <th>Назва</th>
              <th>Категорія</th>
              <th>Бренд</th>
              <th>Ціна</th>
              <th>Наявність</th>
              <th className={styles.colActions}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => (
              <tr key={p.id}>
                <td>
                  <label className={styles.chk}>
                    <input type="checkbox" checked={checked.has(p.id)} onChange={() => toggleCheck(p.id)} aria-label={p.name} />
                    <span className={styles.chkBox}><CheckMini /></span>
                  </label>
                </td>
                <td>
                  <span className={styles.thumb}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" />
                  </span>
                </td>
                <td>
                  <span className={styles.name}>{p.name}</span>
                  <span className={styles.sku}>SKU: {p.sku}</span>
                </td>
                <td><span className={styles.catBadge}>{catLabel(p.categorySlug)}</span></td>
                <td className={styles.brand}>{p.brand}</td>
                <td>
                  <span className={styles.price}>{fmt(p.price)} грн</span>
                  {p.oldPrice != null && <span className={styles.oldPrice}>{fmt(p.oldPrice)} грн</span>}
                </td>
                <td>
                  <button
                    type="button"
                    className={`${styles.stock} ${p.inStock ? styles.stockIn : styles.stockOut}`}
                    onClick={() => toggleStock(p.id)}
                  >
                    {p.inStock ? 'В наявності' : 'Немає'}
                  </button>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button type="button" className={styles.editBtn} onClick={() => setModal({ mode: 'edit', id: p.id })} aria-label="Редагувати">
                      <EditIcon />
                    </button>
                    <button type="button" className={styles.delBtn} onClick={() => setDeletingId(p.id)} aria-label="Видалити">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.emptyRow}>Товарів не знайдено</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pag}>
          <button type="button" className={styles.pagBtn} disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
            <ArrowL />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.pagBtn} ${p === safePage ? styles.pagActive : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button type="button" className={styles.pagBtn} disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>
            <ArrowR />
          </button>
        </div>
      )}

      {modal && (
        <ProductModal
          mode={modal.mode}
          initial={modalInitial}
          categories={CATEGORIES}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deletingId && (
        <ConfirmDialog
          message="Видалити цей товар?"
          onConfirm={doDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
