'use client';

import { useMemo, useState } from 'react';
import type { Vertical } from '@prisma/client';
import ProductModal, {
  type ProductFormData,
} from '@/components/admin/ProductModal/ProductModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog/ConfirmDialog';
import styles from './products.module.css';

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categorySlug: string;
  categoryId: string;
  brand: string;
  price: number;
  oldPrice?: number;
  currency: string;
  inStock: boolean;
  image: string;
  isHit: boolean;
  isNew: boolean;
  dietaryTags: string[];
  allergens: string;
  portion: string;
  prepTime: number;
}

interface CategoryItem {
  id: string;
  slug: string;
  label: string;
}

interface Props {
  vertical: Vertical;
  initialProducts: AdminProduct[];
  categories: CategoryItem[];
}

const PAGE_SIZE = 6;

function mapApiProduct(p: Record<string, unknown>, cats: CategoryItem[] = []): AdminProduct {
  const meta = (p.metadata ?? {}) as Record<string, unknown>;
  const cat = p.category as Record<string, unknown> | null;
  const categoryId = (p.categoryId as string) ?? '';
  const categorySlug =
    (cat?.slug as string) ?? cats.find((c) => c.id === categoryId)?.slug ?? '';
  return {
    id: p.id as string,
    name: p.nameKey as string,
    slug: p.slug as string,
    sku: (meta.sku as string) ?? '',
    categorySlug,
    categoryId,
    brand: (p.brand as string) ?? '',
    price: p.price as number,
    oldPrice: (p.oldPrice as number | null) ?? undefined,
    currency: (p.currency as string) ?? 'UAH',
    inStock: p.inStock as boolean,
    image: (p.image as string) ?? '/placeholder-product.svg',
    isHit: (p.isHit as boolean) ?? false,
    isNew: (p.isNew as boolean) ?? false,
    dietaryTags: (meta.dietaryTags as string[]) ?? [],
    allergens: (meta.allergens as string) ?? '',
    portion: (meta.portion as string) ?? '',
    prepTime: (meta.prepTime as number) ?? 0,
  };
}

const fmtPrice = (price: number, currency: string) => {
  if (currency === 'EUR') return `€${price.toFixed(2)}`;
  return `${new Intl.NumberFormat('uk-UA').format(price)} грн`;
};

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

export default function AdminProductsClient({ vertical, initialProducts, categories }: Props) {
  const isRestaurant = vertical === 'RESTAURANT';

  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const catLabel = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      if (categoryFilter !== 'all' && p.categorySlug !== categoryFilter) return false;
      if (!isRestaurant && brandFilter !== 'all' && p.brand !== brandFilter) return false;
      if (inStockOnly && !p.inStock) return false;
      return true;
    });
  }, [products, search, categoryFilter, brandFilter, inStockOnly, isRestaurant]);

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

  const handleSave = async (data: ProductFormData) => {
    setLoading(true);
    try {
      if (modal && modal.mode === 'edit') {
        const res = await fetch(`/api/products/${modal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nameKey: data.name,
            brand: data.brand || null,
            price: Number(data.price),
            oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
            inStock: data.inStock,
            image: data.image || null,
            categoryId: categories.find((c) => c.slug === data.category)?.id ?? null,
            metadata: isRestaurant
              ? {
                  dietaryTags: data.dietaryTags ?? [],
                  allergens: data.allergens ?? '',
                  portion: data.portion ?? '',
                  prepTime: data.prepTime ?? 0,
                }
              : undefined,
          }),
        });
        if (res.ok) {
          const updated = await res.json() as Record<string, unknown>;
          setProducts((prev) =>
            prev.map((p) => (p.id === (modal as { mode: 'edit'; id: string }).id ? mapApiProduct(updated, categories) : p)),
          );
        }
      } else {
        const slug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9а-яіїєґ\s-]/gi, '')
          .replace(/\s+/g, '-')
          .slice(0, 80);
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: `${slug}-${Date.now().toString(36)}`,
            nameKey: data.name,
            brand: data.brand || null,
            price: Number(data.price),
            oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
            inStock: data.inStock,
            image: data.image || null,
            categoryId: categories.find((c) => c.slug === data.category)?.id ?? null,
            metadata: isRestaurant
              ? {
                  dietaryTags: data.dietaryTags ?? [],
                  allergens: data.allergens ?? '',
                  portion: data.portion ?? '',
                  prepTime: data.prepTime ?? 0,
                }
              : { sku: `NEW-${Date.now().toString().slice(-5)}` },
          }),
        });
        if (res.ok) {
          const created = await res.json() as Record<string, unknown>;
          setProducts((prev) => [mapApiProduct(created, categories), ...prev]);
        }
      }
    } catch (err) {
      console.error('Product save error:', err);
    } finally {
      setLoading(false);
      setModal(null);
    }
  };

  const toggleStock = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !product.inStock }),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p)));
      }
    } catch (err) {
      console.error('Toggle stock error:', err);
    }
  };

  const doDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/products/${deletingId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== deletingId));
        setChecked((prev) => {
          const next = new Set(prev);
          next.delete(deletingId);
          return next;
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const deleteSelected = async () => {
    const ids = Array.from(checked);
    setLoading(true);
    try {
      await Promise.all(ids.map((id) => fetch(`/api/products/${id}`, { method: 'DELETE' })));
      setProducts((prev) => prev.filter((p) => !checked.has(p.id)));
      setChecked(new Set());
    } catch (err) {
      console.error('Bulk delete error:', err);
    } finally {
      setLoading(false);
    }
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
        image: editing.image !== '/placeholder-product.svg' ? editing.image : undefined,
        dietaryTags: editing.dietaryTags,
        allergens: editing.allergens,
        portion: editing.portion,
        prepTime: editing.prepTime,
      }
    : {
        name: '',
        brand: '',
        category: categories[0]?.slug ?? '',
        price: '',
        oldPrice: '',
        inStock: true,
      };

  const pageTitle = isRestaurant ? 'Страви / Меню' : 'Товари';
  const addLabel = isRestaurant ? 'Додати страву' : 'Додати товар';

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1 className={styles.h1}>{pageTitle}</h1>
        <button type="button" className={styles.addBtn} onClick={() => setModal({ mode: 'add' })}>
          <PlusIcon />
          {addLabel}
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <SearchIcon />
        <input
          className={styles.search}
          type="search"
          placeholder={isRestaurant ? 'Пошук страв...' : 'Пошук товарів...'}
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
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>

        {!isRestaurant && (
          <select
            className={styles.select}
            value={brandFilter}
            onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Всі бренди</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}

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
          <span>Вибрано {checked.size} {isRestaurant ? 'страв' : 'товарів'}</span>
          <button type="button" className={styles.bulkDelete} onClick={() => void deleteSelected()}>
            <TrashIcon />
            Видалити вибрані
          </button>
        </div>
      )}

      {/* Table */}
      <div className={`${styles.tableWrap} ${loading ? styles.loading : ''}`}>
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
              {!isRestaurant && <th>Бренд</th>}
              {isRestaurant && <th>Порція</th>}
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
                  <div className={styles.imgWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.name}
                      className={styles.productImg}
                      loading="lazy"
                    />
                  </div>
                </td>
                <td>
                  <span className={styles.name}>{p.name}</span>
                  {!isRestaurant && <span className={styles.sku}>SKU: {p.sku}</span>}
                </td>
                <td><span className={styles.catBadge}>{catLabel(p.categorySlug)}</span></td>
                {!isRestaurant && <td className={styles.brand}>{p.brand}</td>}
                {isRestaurant && <td className={styles.portion}>{p.portion || '—'}</td>}
                <td>
                  <span className={styles.price}>{fmtPrice(p.price, p.currency)}</span>
                  {p.oldPrice != null && (
                    <span className={styles.oldPrice}>{fmtPrice(p.oldPrice, p.currency)}</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className={`${styles.stock} ${p.inStock ? styles.stockIn : styles.stockOut}`}
                    onClick={() => void toggleStock(p.id)}
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
                <td colSpan={8} className={styles.emptyRow}>
                  {isRestaurant ? 'Страв не знайдено' : 'Товарів не знайдено'}
                </td>
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              type="button"
              className={`${styles.pagBtn} ${pg === safePage ? styles.pagActive : ''}`}
              onClick={() => setPage(pg)}
            >
              {pg}
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
          categories={categories}
          vertical={vertical}
          currency={products[0]?.currency ?? 'UAH'}
          onSave={(data) => void handleSave(data)}
          onClose={() => setModal(null)}
        />
      )}

      {deletingId && (
        <ConfirmDialog
          message={isRestaurant ? 'Видалити цю страву?' : 'Видалити цей товар?'}
          onConfirm={() => void doDelete()}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
