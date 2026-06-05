import { PrismaClient, Vertical, DeliveryMode, OrderStatus, PaymentStatus, PromoType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcryptjs from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter } as never);

async function main() {
  console.log('🍝 Seeding Adriano restaurant...');

  // ============ STORE ============
  const store = await db.store.upsert({
    where: { slug: 'adriano' },
    update: {},
    create: {
      name: 'Adriano Ristorante',
      slug: 'adriano',
      vertical: Vertical.RESTAURANT,
      regionBundle: 'EU',
      themeConfig: {
        colors: {
          primary:       '#b91c1c',
          primaryDark:   '#991b1b',
          primaryLight:  '#fef2f2',
          text:          '#1c1917',
          textSecondary: '#78716c',
          textMuted:     '#a8a29e',
          border:        '#e7e5e4',
          bgSubtle:      '#fafaf9',
          success:       '#15803d',
          error:         '#dc2626',
        },
        layout: {
          heroType:     'full-width',
          cardStyle:    'border',
          navPosition:  'top',
          borderRadius: 'rounded',
        },
      },
    },
  });
  console.log('✅ Store:', store.slug);

  // ============ CATEGORIES ============
  const categoryData = [
    { slug: 'antipasti', nameKey: 'Antipasti',     sortOrder: 1 },
    { slug: 'primi',     nameKey: 'Primi Piatti',  sortOrder: 2 },
    { slug: 'secondi',   nameKey: 'Secondi Piatti',sortOrder: 3 },
    { slug: 'pizza',     nameKey: 'Pizza',          sortOrder: 4 },
    { slug: 'dolci',     nameKey: 'Dolci',          sortOrder: 5 },
    { slug: 'bevande',   nameKey: 'Bevande',        sortOrder: 6 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await db.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: cat.slug } },
      update: { nameKey: cat.nameKey },
      create: { ...cat, storeId: store.id },
    });
    categories[cat.slug] = created.id;
  }
  console.log('✅ Categories:', Object.keys(categories).length);

  // ============ PRODUCTS ============
  const productData = [
    // --- Antipasti ---
    {
      slug: 'bruschetta-classica',
      nameKey: 'Bruschetta Classica',
      categorySlug: 'antipasti',
      price: 7.9,
      rating: 4.5,
      reviewCount: 89,
      inStock: true,
      isHit: true,
      metadata: { portionSize: '180g', cookTime: 10, spiceLevel: 'mild', calories: 280, vegetarian: true, vegan: false, allergens: ['gluten', 'dairy'] },
    },
    {
      slug: 'carpaccio-di-manzo',
      nameKey: 'Carpaccio di Manzo',
      categorySlug: 'antipasti',
      price: 14.5,
      rating: 5,
      reviewCount: 67,
      inStock: true,
      isNew: true,
      metadata: { portionSize: '150g', cookTime: 5, spiceLevel: 'mild', calories: 210, vegetarian: false, vegan: false, allergens: ['dairy'] },
    },
    {
      slug: 'caprese-salad',
      nameKey: 'Insalata Caprese',
      categorySlug: 'antipasti',
      price: 9.5,
      rating: 4.5,
      reviewCount: 112,
      inStock: true,
      metadata: { portionSize: '200g', cookTime: 5, calories: 240, vegetarian: true, vegan: false, allergens: ['dairy'] },
    },

    // --- Primi ---
    {
      slug: 'spaghetti-carbonara',
      nameKey: 'Spaghetti alla Carbonara',
      categorySlug: 'primi',
      price: 14.9,
      rating: 5,
      reviewCount: 234,
      inStock: true,
      isHit: true,
      metadata: { portionSize: '300g', cookTime: 15, spiceLevel: 'mild', calories: 520, vegetarian: false, vegan: false, allergens: ['gluten', 'eggs', 'dairy'] },
    },
    {
      slug: 'penne-arrabiata',
      nameKey: "Penne all'Arrabbiata",
      categorySlug: 'primi',
      price: 12.5,
      rating: 4.5,
      reviewCount: 156,
      inStock: true,
      isHit: true,
      metadata: { portionSize: '280g', cookTime: 12, spiceLevel: 'hot', calories: 410, vegetarian: true, vegan: true, allergens: ['gluten'] },
    },
    {
      slug: 'risotto-funghi',
      nameKey: 'Risotto ai Funghi Porcini',
      categorySlug: 'primi',
      price: 15.9,
      rating: 5,
      reviewCount: 98,
      inStock: true,
      isNew: true,
      metadata: { portionSize: '300g', cookTime: 25, spiceLevel: 'mild', calories: 480, vegetarian: true, vegan: false, allergens: ['dairy'] },
    },
    {
      slug: 'lasagna-bolognese',
      nameKey: 'Lasagna alla Bolognese',
      categorySlug: 'primi',
      price: 13.9,
      rating: 4.5,
      reviewCount: 187,
      inStock: true,
      metadata: { portionSize: '350g', cookTime: 20, spiceLevel: 'mild', calories: 620, vegetarian: false, vegan: false, allergens: ['gluten', 'eggs', 'dairy'] },
    },

    // --- Secondi ---
    {
      slug: 'osso-buco',
      nameKey: 'Ossobuco alla Milanese',
      categorySlug: 'secondi',
      price: 24.5,
      rating: 5,
      reviewCount: 45,
      inStock: true,
      isNew: true,
      metadata: { portionSize: '400g', cookTime: 35, spiceLevel: 'mild', calories: 680, vegetarian: false, vegan: false, allergens: ['dairy'] },
    },
    {
      slug: 'saltimbocca-romana',
      nameKey: 'Saltimbocca alla Romana',
      categorySlug: 'secondi',
      price: 19.5,
      rating: 4.5,
      reviewCount: 73,
      inStock: true,
      metadata: { portionSize: '280g', cookTime: 20, spiceLevel: 'mild', calories: 520, vegetarian: false, vegan: false, allergens: ['dairy'] },
    },
    {
      slug: 'grilled-sea-bass',
      nameKey: 'Branzino alla Griglia',
      categorySlug: 'secondi',
      price: 22.9,
      rating: 5,
      reviewCount: 61,
      inStock: true,
      isHit: true,
      metadata: { portionSize: '320g', cookTime: 25, spiceLevel: 'mild', calories: 380, vegetarian: false, vegan: false, allergens: ['fish'] },
    },

    // --- Pizza ---
    {
      slug: 'margherita',
      nameKey: 'Pizza Margherita',
      categorySlug: 'pizza',
      price: 11.9,
      rating: 4.5,
      reviewCount: 312,
      inStock: true,
      isHit: true,
      metadata: { portionSize: '450g / 32cm', cookTime: 8, spiceLevel: 'mild', calories: 720, vegetarian: true, vegan: false, allergens: ['gluten', 'dairy'] },
    },
    {
      slug: 'quattro-formaggi',
      nameKey: 'Pizza Quattro Formaggi',
      categorySlug: 'pizza',
      price: 14.9,
      rating: 5,
      reviewCount: 198,
      inStock: true,
      metadata: { portionSize: '480g / 32cm', cookTime: 10, spiceLevel: 'mild', calories: 880, vegetarian: true, vegan: false, allergens: ['gluten', 'dairy'] },
    },
    {
      slug: 'diavola',
      nameKey: 'Pizza Diavola',
      categorySlug: 'pizza',
      price: 13.5,
      rating: 4.5,
      reviewCount: 145,
      inStock: true,
      metadata: { portionSize: '460g / 32cm', cookTime: 8, spiceLevel: 'hot', calories: 780, vegetarian: false, vegan: false, allergens: ['gluten', 'dairy'] },
    },
    {
      slug: 'pizza-prosciutto',
      nameKey: 'Pizza Prosciutto e Rucola',
      categorySlug: 'pizza',
      price: 15.5,
      rating: 5,
      reviewCount: 167,
      inStock: true,
      isNew: true,
      metadata: { portionSize: '470g / 32cm', cookTime: 9, spiceLevel: 'mild', calories: 820, vegetarian: false, vegan: false, allergens: ['gluten', 'dairy'] },
    },

    // --- Dolci ---
    {
      slug: 'tiramisu',
      nameKey: 'Tiramisù',
      categorySlug: 'dolci',
      price: 6.9,
      rating: 5,
      reviewCount: 278,
      inStock: true,
      isHit: true,
      metadata: { portionSize: '150g', cookTime: 0, calories: 380, vegetarian: true, vegan: false, allergens: ['gluten', 'eggs', 'dairy'] },
    },
    {
      slug: 'panna-cotta',
      nameKey: 'Panna Cotta',
      categorySlug: 'dolci',
      price: 5.9,
      rating: 4.5,
      reviewCount: 134,
      inStock: true,
      metadata: { portionSize: '130g', cookTime: 0, calories: 320, vegetarian: true, vegan: false, allergens: ['dairy'] },
    },

    // --- Bevande ---
    {
      slug: 'espresso',
      nameKey: 'Espresso',
      categorySlug: 'bevande',
      price: 2.5,
      rating: 5,
      reviewCount: 89,
      inStock: true,
      metadata: { portionSize: '30ml', cookTime: 2, calories: 5, vegetarian: true, vegan: true },
    },
    {
      slug: 'chianti-glass',
      nameKey: 'Chianti (bicchiere)',
      categorySlug: 'bevande',
      price: 7.5,
      rating: 4.5,
      reviewCount: 56,
      inStock: true,
      isHit: true,
      metadata: { portionSize: '150ml', cookTime: 0, calories: 125, vegetarian: true, vegan: true },
    },
    {
      slug: 'limonata',
      nameKey: 'Limonata Fatta in Casa',
      categorySlug: 'bevande',
      price: 4.5,
      rating: 4.5,
      reviewCount: 43,
      inStock: true,
      metadata: { portionSize: '300ml', cookTime: 0, calories: 120, vegetarian: true, vegan: true },
    },
  ];

  const products: Record<string, string> = {};
  for (const p of productData) {
    const { categorySlug, ...rest } = p;
    const created = await db.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: p.slug } },
      update: {
        nameKey: rest.nameKey,
        price: rest.price,
        currency: '€',
        metadata: rest.metadata ?? {},
        categoryId: categories[categorySlug],
      },
      create: {
        ...rest,
        image: '/placeholder-product.svg',
        images: [],
        currency: '€',
        storeId: store.id,
        categoryId: categories[categorySlug],
      },
    });
    products[p.slug] = created.id;
  }
  console.log('✅ Products:', Object.keys(products).length, 'menu items');

  // ============ ADMIN USER ============
  const adminEmail = 'admin@adriano.restaurant';
  const passwordHash = await bcryptjs.hash('admin123', 12);

  await db.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Marco',
      role: 'superadmin',
      storeId: store.id,
    },
  });
  console.log('✅ AdminUser:', adminEmail);

  // ============ CUSTOMERS ============
  const customersData = [
    { email: 'luigi@example.it', name: 'Luigi Rossi', phone: '+393331234567' },
    { email: 'sofia@example.it', name: 'Sofia Conti', phone: '+393457654321' },
  ];

  const customerIds: string[] = [];
  for (const c of customersData) {
    const created = await db.customer.upsert({
      where: { storeId_email: { storeId: store.id, email: c.email } },
      update: {},
      create: { ...c, storeId: store.id },
    });
    customerIds.push(created.id);
  }
  console.log('✅ Customers:', customerIds.length);

  // ============ DELIVERY ZONES ============
  const zonesData = [
    { name: 'Centro storico', fee: 0,   minOrder: 300, estimatedMin: 20, estimatedMax: 35 },
    { name: 'Quartiere 2',    fee: 50,  minOrder: 200, estimatedMin: 30, estimatedMax: 50 },
    { name: 'Periferia',      fee: 100, minOrder: 400, estimatedMin: 40, estimatedMax: 60 },
  ];

  const zoneIds: string[] = [];
  for (const z of zonesData) {
    const existing = await db.deliveryZone.findFirst({ where: { storeId: store.id, name: z.name } });
    if (!existing) {
      const created = await db.deliveryZone.create({ data: { ...z, storeId: store.id } });
      zoneIds.push(created.id);
    } else {
      zoneIds.push(existing.id);
    }
  }
  console.log('✅ DeliveryZones:', zoneIds.length);

  // ============ SAMPLE ORDERS ============
  const ordersData = [
    {
      orderNumber: 'ADR-2026-0001',
      status: OrderStatus.DELIVERED,
      customerId: customerIds[0],
      deliveryMode: DeliveryMode.DINE_IN,
      paymentMethod: 'at_table',
      paymentStatus: PaymentStatus.PAID,
      subtotal: 1070,
      deliveryFee: 0,
      discount: 0,
      total: 1070,
      currency: '€',
      items: [
        { productId: products['bruschetta-classica'], quantity: 1, price: 220 },
        { productId: products['spaghetti-carbonara'], quantity: 2, price: 320 },
        { productId: products['tiramisu'],            quantity: 1, price: 180 },
        { productId: products['espresso'],            quantity: 1, price: 70 },
      ],
    },
    {
      orderNumber: 'ADR-2026-0002',
      status: OrderStatus.PROCESSING,
      customerId: customerIds[1],
      deliveryMode: DeliveryMode.COURIER,
      paymentMethod: 'card',
      paymentStatus: PaymentStatus.PAID,
      subtotal: 850,
      deliveryFee: 50,
      discount: 0,
      total: 900,
      currency: '€',
      items: [
        { productId: products['margherita'],  quantity: 2, price: 250 },
        { productId: products['diavola'],     quantity: 1, price: 290 },
        { productId: products['panna-cotta'], quantity: 1, price: 160 },
      ],
    },
  ];

  for (const order of ordersData) {
    const exists = await db.order.findFirst({ where: { storeId: store.id, orderNumber: order.orderNumber } });
    if (!exists) {
      const { items, ...orderRest } = order;
      await db.order.create({
        data: {
          ...orderRest,
          storeId: store.id,
          deliveryAddress: { city: 'Roma', country: 'IT' },
          items: { create: items },
        },
      });
    }
  }
  console.log('✅ Orders: 2');

  // ============ PROMOTIONS ============
  await db.promotion.upsert({
    where: { id: 'adriano-lunch-special' },
    update: {},
    create: {
      id: 'adriano-lunch-special',
      type: PromoType.DISCOUNT,
      title: 'Lunch Special — Primi + Bevanda -15%',
      description: 'Order any pasta with a drink and get 15% off',
      discountPercent: 15,
      productIds: [],
      categoryIds: [],
      startsAt: new Date('2026-01-01'),
      active: true,
      storeId: store.id,
    },
  });
  console.log('✅ Promotions: 1');

  // ============ KNOWLEDGE BASE ============
  const knowledgeData = [
    {
      title: 'Delivery — Adriano',
      content: 'We deliver within 3 zones in Rome. Centro storico — free delivery for orders over €3. Zone 2 — €0.50 delivery fee. Periferia — €1 fee, minimum order €4. Delivery time 20-60 minutes depending on zone.',
      category: 'delivery',
    },
    {
      title: 'Allergens & Dietary',
      content: 'All menu items list allergens. We offer vegetarian and vegan options. Gluten-free pasta available on request (+€2). Please inform staff about allergies when ordering.',
      category: 'faq',
    },
    {
      title: 'Reservations',
      content: 'Reserve a table by phone +39 06 1234567 or through the website. Seating capacity: 60 indoor, 30 terrace. Private events available for groups of 20+.',
      category: 'faq',
    },
    {
      title: 'Opening Hours',
      content: 'Monday-Friday: 12:00-15:00, 18:00-23:00. Saturday-Sunday: 12:00-23:00. Kitchen closes 30 minutes before closing.',
      category: 'faq',
    },
  ];

  for (const entry of knowledgeData) {
    const exists = await db.knowledgeEntry.findFirst({ where: { storeId: store.id, title: entry.title } });
    if (!exists) {
      await db.knowledgeEntry.create({ data: { ...entry, storeId: store.id } });
    }
  }
  console.log('✅ KnowledgeBase:', knowledgeData.length, 'entries');

  // ── Restaurant Tables ──
  console.log('🪑  Seeding restaurant tables...');
  const tableData = [
    // Terrace
    { number: 'T1',  seats: 2, zone: 'terrace', x: 60,  y: 60,  type: 'round' },
    { number: 'T2',  seats: 2, zone: 'terrace', x: 160, y: 60,  type: 'round' },
    { number: 'T3',  seats: 4, zone: 'terrace', x: 60,  y: 150, type: 'round' },
    // Main Hall
    { number: 'T4',  seats: 4, zone: 'main',    x: 300, y: 60,  type: 'round' },
    { number: 'T5',  seats: 6, zone: 'main',    x: 400, y: 60,  type: 'rect'  },
    { number: 'T6',  seats: 2, zone: 'main',    x: 300, y: 150, type: 'round' },
    { number: 'T7',  seats: 4, zone: 'main',    x: 400, y: 150, type: 'round' },
    { number: 'T8',  seats: 8, zone: 'main',    x: 300, y: 240, type: 'rect'  },
    { number: 'T9',  seats: 2, zone: 'main',    x: 400, y: 240, type: 'round' },
    // Private Room
    { number: 'T10', seats: 6, zone: 'private', x: 540, y: 60,  type: 'rect'  },
    { number: 'T11', seats: 4, zone: 'private', x: 540, y: 150, type: 'round' },
    { number: 'T12', seats: 2, zone: 'private', x: 540, y: 240, type: 'round' },
  ];

  for (const td of tableData) {
    await db.restaurantTable.upsert({
      where: { storeId_number: { storeId: store.id, number: td.number } },
      update: td,
      create: { storeId: store.id, ...td },
    });
  }
  console.log(`   ✔ ${tableData.length} tables`);

  // Gallery images
  console.log('🖼️  Seeding gallery images...');
  const galleryImages = [
    { url: '/placeholder-gallery.svg', alt: 'Інтер\'єр ресторану Adriano', sortOrder: 0 },
    { url: '/placeholder-gallery.svg', alt: 'Страви від шеф-кухаря',       sortOrder: 1 },
    { url: '/placeholder-gallery.svg', alt: 'Тераса ресторану',             sortOrder: 2 },
    { url: '/placeholder-gallery.svg', alt: 'Італійська піца з печі',       sortOrder: 3 },
    { url: '/placeholder-gallery.svg', alt: 'Винна карта',                  sortOrder: 4 },
    { url: '/placeholder-gallery.svg', alt: 'Приватні заходи',              sortOrder: 5 },
  ];

  for (const img of galleryImages) {
    await db.galleryImage.upsert({
      where: {
        id: `gallery-adriano-${img.sortOrder}`,
      },
      update: { url: img.url, alt: img.alt },
      create: {
        id: `gallery-adriano-${img.sortOrder}`,
        storeId: store.id,
        url: img.url,
        alt: img.alt,
        sortOrder: img.sortOrder,
        active: true,
      },
    });
  }
  console.log(`   ✔ ${galleryImages.length} gallery images`);

  console.log('\n🎉 Adriano seed complete!');
  console.log(`   Store slug:   ${store.slug}`);
  console.log(`   Admin email:  ${adminEmail}`);
  console.log(`   Admin pass:   admin123`);
  console.log(`   Vertical:     RESTAURANT`);
  console.log(`   Products:     ${Object.keys(products).length} menu items`);
  console.log(`\n💡 To switch: set STORE_SLUG=adriano in .env`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
