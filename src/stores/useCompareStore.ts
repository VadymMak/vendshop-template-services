import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompareItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  oldPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

interface CompareStore {
  items: CompareItem[];
  toggle: (item: CompareItem) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) {
            return { items: state.items.filter((i) => i.id !== item.id) };
          }
          if (state.items.length >= 4) return state;
          return { items: [...state.items, item] };
        }),

      has: (id) => get().items.some((i) => i.id === id),

      clear: () => set({ items: [] }),
    }),
    {
      name: `${process.env.NEXT_PUBLIC_STORE_SLUG ?? 'store'}-compare`,
      skipHydration: true,
    },
  ),
);
