import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { verifyAdminToken, getAdminSecret, ADMIN_COOKIE } from '@/lib/adminAuth';
import { cookies } from 'next/headers';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';

// GET /api/products — list with optional filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Supports comma-separated values: ?category=drills,grinders  ?brand=Makita,Bosch
  const categorySlugs = (searchParams.get('category') ?? '').split(',').filter(Boolean);
  const brandNames = (searchParams.get('brand') ?? '').split(',').filter(Boolean);
  const q = searchParams.get('q')?.trim() ?? '';
  const inStock = searchParams.get('inStock');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') ?? 'popular';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '12', 10));

  try {
    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    const where: Prisma.ProductWhereInput = {
      storeId: store.id,
      ...(q ? {
        OR: [
          { nameKey: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
      ...(inStock === 'true' ? { inStock: true } : {}),
      ...(brandNames.length > 0
        ? { brand: { in: brandNames, mode: 'insensitive' as const } }
        : {}),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
              ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
            },
          }
        : {}),
      ...(categorySlugs.length > 0
        ? { category: { slug: { in: categorySlugs } } }
        : {}),
    };

    const orderBy = (() => {
      switch (sort) {
        case 'price-asc':  return { price: 'asc' as const };
        case 'price-desc': return { price: 'desc' as const };
        case 'new':        return { createdAt: 'desc' as const };
        default:           return { reviewCount: 'desc' as const };
      }
    })();

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true },
      }),
    ]);

    return NextResponse.json({ products, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/products — create (admin only)
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = await verifyAdminToken(token, getAdminSecret());
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

    const product = await db.product.create({
      data: {
        slug: String(body.slug),
        nameKey: String(body.nameKey),
        brand: body.brand ? String(body.brand) : null,
        image: body.image ? String(body.image) : null,
        images: Array.isArray(body.images) ? (body.images as string[]) : [],
        price: Number(body.price),
        oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
        currency: body.currency ? String(body.currency) : 'грн',
        inStock: Boolean(body.inStock ?? true),
        isHit: Boolean(body.isHit ?? false),
        isNew: Boolean(body.isNew ?? false),
        rating: Number(body.rating ?? 0),
        reviewCount: Number(body.reviewCount ?? 0),
        metadata: body.metadata !== undefined && body.metadata !== null
          ? (body.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        categoryId: body.categoryId ? String(body.categoryId) : null,
        storeId: store.id,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[POST /api/products]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
