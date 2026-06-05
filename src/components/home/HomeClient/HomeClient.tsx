'use client';

import HeroSection from '@/components/home/HeroSection/HeroSection';
import MenuCategories from '@/components/home/MenuCategories/MenuCategories';
import DailySpecials from '@/components/home/DailySpecials/DailySpecials';
import ReservationSection from '@/components/home/ReservationSection/ReservationSection';
import GallerySection from '@/components/home/GallerySection/GallerySection';
import AboutSection from '@/components/home/AboutSection/AboutSection';
import CategoriesGrid from '@/components/home/CategoriesGrid/CategoriesGrid';
import BestSellers from '@/components/home/BestSellers/BestSellers';
import ProductOfDay from '@/components/home/ProductOfDay/ProductOfDay';
import BrandsSection from '@/components/home/BrandsSection/BrandsSection';
import TrustStrip from '@/components/home/TrustStrip/TrustStrip';
import SubscribeBanner from '@/components/home/SubscribeBanner/SubscribeBanner';
import PopularTags from '@/components/home/PopularTags/PopularTags';
import { useVerticalConfig } from '@/lib/vertical-context';
import type { ProductCardProps } from '@/components/catalog/ProductCard/ProductCard';
import type { ProductOfDayProps } from '@/components/home/ProductOfDay/ProductOfDay';
import styles from './HomeClient.module.css';

// ProductOfDay without endsAt — we compute it client-side to avoid serialization issues
type ProductOfDayData = Omit<ProductOfDayProps['product'], 'endsAt'>;

export type ProductData = Omit<ProductCardProps, 'onAddToCart' | 'onCompare' | 'onFavorite'>;

interface MenuCategoryItem {
  slug: string;
  nameKey: string;
  image?: string;
  productCount: number;
}

interface DailySpecialItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  badge?: 'chef' | 'popular' | 'new';
}

interface HomeClientProps {
  products: ProductData[];
  productOfDay: ProductOfDayData;
  storeName: string;
  menuCategories?: MenuCategoryItem[];
  dailySpecials?: DailySpecialItem[];
}

// Module-level constant: countdown target is fixed for the session duration.
const ENDS_AT = new Date(Date.now() + ((2 * 24 + 14) * 3600 + 37 * 60 + 22) * 1000);

const noop = (_id: string) => {};
const noopStr = (_s: string) => {};

export default function HomeClient({ products, productOfDay, storeName, menuCategories, dailySpecials }: HomeClientProps) {
  const vConfig = useVerticalConfig();
  const sections = vConfig.ui.homeSections;

  const fullProducts: ProductCardProps[] = products.map((p) => ({
    ...p,
    onAddToCart: noop,
    onCompare: noop,
    onFavorite: noop,
  }));

  return (
    <>
      {sections.map((section) => {
        switch (section) {
          case 'categories':
            return <CategoriesGrid key={section} onCategoryClick={noopStr} />;

          case 'bestsellers':
            return (
              <section key={section} className={styles.bestSellersSection}>
                <div className={styles.bestSellersWrap}>
                  <BestSellers products={fullProducts} />
                  {sections.includes('product-of-day') && (
                    <ProductOfDay product={{ ...productOfDay, endsAt: ENDS_AT }} onAddToCart={noop} />
                  )}
                </div>
              </section>
            );

          case 'product-of-day':
            // Rendered inside the bestsellers section above to preserve the side-by-side layout
            return null;

          case 'brands':
            return <BrandsSection key={section} onBrandClick={noopStr} />;

          case 'trust-strip':
            return (
              <section key={section} id="contacts">
                <TrustStrip />
              </section>
            );

          case 'subscribe':
            return <SubscribeBanner key={section} />;

          case 'popular-tags':
            return <PopularTags key={section} />;

          case 'hero':
            // ECOMMERCE hero not implemented — guard prevents rendering
            if (vConfig.vertical === 'ECOMMERCE') return null;
            return (
              <HeroSection
                key={section}
                storeName={storeName}
                dailySpecial={
                  fullProducts[0]
                    ? {
                        name: fullProducts[0].name,
                        price: fullProducts[0].price,
                        currency: fullProducts[0].currency ?? '€',
                      }
                    : undefined
                }
              />
            );

          case 'menu-categories':
            return (
              <section key={section} id="menu">
                <MenuCategories categories={menuCategories} />
              </section>
            );

          case 'daily-specials':
            return (
              <section key={section} id="specials">
                <DailySpecials items={dailySpecials} />
              </section>
            );

          case 'reservations':
            return (
              <section key={section} id="reservations">
                <ReservationSection />
              </section>
            );

          case 'gallery':
            return (
              <section key={section} id="gallery">
                <GallerySection />
              </section>
            );

          case 'about':
            return (
              <section key={section} id="about">
                <AboutSection />
              </section>
            );

          // Future vertical sections — not yet implemented
          case 'delivery-zones':
            return null;

          default:
            return null;
        }
      })}
    </>
  );
}
