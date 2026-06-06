import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
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

interface FavoritesStore {
  items: FavoriteItem[];
  toggle: (item: FavoriteItem) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) =>
        set((state) => ({
          items: state.items.some((i) => i.id === item.id)
            ? state.items.filter((i) => i.id !== item.id)
            : [...state.items, item],
        })),

      has: (id) => get().items.some((i) => i.id === id),

      clear: () => set({ items: [] }),
    }),
    {
      name: `${process.env.NEXT_PUBLIC_STORE_SLUG ?? 'store'}-favorites`,
      skipHydration: true,
    },
  ),
);
