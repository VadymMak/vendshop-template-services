import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus, PaymentStatus, PromoType } from '@prisma/client';

const STORE_SLUG = process.env.STORE_SLUG ?? 'electromarket';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001';

// ─── Tool definitions for Claude API ───────────────────────────────────────
const TOOLS = [
  {
    name: 'get_products',
    description: 'Получить список продуктов магазина с фильтрами',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: { type: 'string', description: 'Slug категории: drills, grinders, perforators, jigsaws, sanders, lasers, measuring, accessories' },
        brand:    { type: 'string', description: 'Бренд: Makita, Bosch, DeWalt, Milwaukee, Metabo' },
        inStock:  { type: 'boolean' },
        maxPrice: { type: 'number' },
        limit:    { type: 'number', description: 'Количество (default 10)' },
      },
    },
  },
  {
    name: 'update_product_price',
    description: 'Изменить цену продукта',
    input_schema: {
      type: 'object' as const,
      properties: {
        productId: { type: 'string' },
        newPrice:  { type: 'number' },
        oldPrice:  { type: 'number', description: 'Старая цена для отображения скидки' },
      },
      required: ['productId', 'newPrice'],
    },
  },
  {
    name: 'get_orders',
    description: 'Получить заказы с фильтрами по статусу и периоду',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
        period: { type: 'string', enum: ['today', 'week', 'month', 'all'] },
        limit:  { type: 'number' },
      },
    },
  },
  {
    name: 'update_order_status',
    description: 'Обновить статус заказа. Можно добавить номер отслеживания.',
    input_schema: {
      type: 'object' as const,
      properties: {
        orderId:        { type: 'string' },
        status:         { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] },
        trackingNumber: { type: 'string' },
        internalNote:   { type: 'string' },
      },
      required: ['orderId', 'status'],
    },
  },
  {
    name: 'get_customers',
    description: 'Список клиентов с количеством заказов и суммой покупок',
    input_schema: {
      type: 'object' as const,
      properties: {
        sortBy: { type: 'string', enum: ['orders', 'revenue', 'recent'] },
        limit:  { type: 'number' },
      },
    },
  },
  {
    name: 'get_analytics',
    description: 'Аналитика магазина: revenue, средний чек, топ продукты',
    input_schema: {
      type: 'object' as const,
      properties: {
        period: { type: 'string', enum: ['today', 'week', 'month', 'all'] },
      },
    },
  },
  {
    name: 'create_promotion',
    description: 'Создать акцию, продукт дня, баннер или бесплатную доставку',
    input_schema: {
      type: 'object' as const,
      properties: {
        type:            { type: 'string', enum: ['DISCOUNT', 'PRODUCT_OF_DAY', 'BANNER', 'FREE_DELIVERY'] },
        title:           { type: 'string' },
        description:     { type: 'string' },
        discountPercent: { type: 'number' },
        productIds:      { type: 'array', items: { type: 'string' } },
        endsAt:          { type: 'string', description: 'ISO date string' },
      },
      required: ['type', 'title'],
    },
  },
  {
    name: 'search_knowledge',
    description: 'Поиск по базе знаний: FAQ, доставка, гарантия, возврат',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string' },
      },
      required: ['query'],
    },
  },
] as const;

// ─── Typed tool params ─────────────────────────────────────────────────────
interface GetProductsParams   { category?: string; brand?: string; inStock?: boolean; maxPrice?: number; limit?: number }
interface UpdatePriceParams   { productId: string; newPrice: number; oldPrice?: number }
interface GetOrdersParams     { status?: string; period?: string; limit?: number }
interface UpdateOrderParams   { orderId: string; status: string; trackingNumber?: string; internalNote?: string }
interface GetCustomersParams  { sortBy?: 'orders' | 'revenue' | 'recent'; limit?: number }
interface GetAnalyticsParams  { period?: string }
interface CreatePromoParams   { type: string; title: string; description?: string; discountPercent?: number; productIds?: string[]; endsAt?: string }
interface SearchKnowledgeParams { query: string }

type ToolParams =
  | { name: 'get_products';         input: GetProductsParams }
  | { name: 'update_product_price'; input: UpdatePriceParams }
  | { name: 'get_orders';           input: GetOrdersParams }
  | { name: 'update_order_status';  input: UpdateOrderParams }
  | { name: 'get_customers';        input: GetCustomersParams }
  | { name: 'get_analytics';        input: GetAnalyticsParams }
  | { name: 'create_promotion';     input: CreatePromoParams }
  | { name: 'search_knowledge';     input: SearchKnowledgeParams }
  | { name: string;                 input: Record<string, unknown> };

function buildDateFilter(period?: string): { createdAt?: { gte: Date } } {
  const now = new Date();
  switch (period) {
    case 'today': return { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } };
    case 'week':  return { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    case 'month': return { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    default: return {};
  }
}

// ─── Tool executor ─────────────────────────────────────────────────────────
async function executeTool(tool: ToolParams): Promise<string> {
  const store = await db.store.findUniqueOrThrow({ where: { slug: STORE_SLUG } });

  switch (tool.name) {
    case 'get_products': {
      const p = tool.input as GetProductsParams;
      const products = await db.product.findMany({
        where: {
          storeId: store.id,
          ...(p.category ? { category: { slug: p.category } } : {}),
          ...(p.brand    ? { brand: { equals: p.brand, mode: 'insensitive' } } : {}),
          ...(p.inStock  !== undefined ? { inStock: p.inStock } : {}),
          ...(p.maxPrice ? { price: { lte: p.maxPrice } } : {}),
        },
        include: { category: true },
        orderBy: { reviewCount: 'desc' },
        take: p.limit ?? 10,
      });
      return JSON.stringify(products.map((pr) => ({
        id: pr.id, nameKey: pr.nameKey, brand: pr.brand,
        price: pr.price, oldPrice: pr.oldPrice, currency: pr.currency,
        inStock: pr.inStock, category: pr.category?.slug,
      })));
    }

    case 'update_product_price': {
      const p = tool.input as UpdatePriceParams;
      const product = await db.product.update({
        where: { id: p.productId },
        data: { price: p.newPrice, ...(p.oldPrice ? { oldPrice: p.oldPrice } : {}) },
      });
      return `Price updated: ${product.nameKey} → ${product.price} ${product.currency}`;
    }

    case 'get_orders': {
      const p = tool.input as GetOrdersParams;
      const orders = await db.order.findMany({
        where: {
          storeId: store.id,
          ...(p.status ? { status: p.status as OrderStatus } : {}),
          ...buildDateFilter(p.period),
        },
        include: { items: { include: { product: true } }, customer: true },
        orderBy: { createdAt: 'desc' },
        take: p.limit ?? 20,
      });
      return JSON.stringify(orders.map((o) => ({
        id: o.id,
        number: o.orderNumber,
        status: o.status,
        total: o.total,
        currency: o.currency,
        customer: o.customer?.name ?? o.guestName ?? 'Guest',
        itemsCount: o.items.length,
        date: o.createdAt,
      })));
    }

    case 'update_order_status': {
      const p = tool.input as UpdateOrderParams;
      const order = await db.order.update({
        where: { id: p.orderId },
        data: {
          status: p.status as OrderStatus,
          ...(p.trackingNumber ? { trackingNumber: p.trackingNumber } : {}),
          ...(p.internalNote  ? { internalNote: p.internalNote }   : {}),
          ...(p.status === 'DELIVERED' ? { paymentStatus: PaymentStatus.PAID } : {}),
        },
      });
      return `Order ${order.orderNumber} updated → ${order.status}`;
    }

    case 'get_customers': {
      const p = tool.input as GetCustomersParams;
      const customers = await db.customer.findMany({
        where: { storeId: store.id },
        include: { orders: { select: { total: true } } },
        take: p.limit ?? 20,
      });
      const enriched = customers.map((c) => ({
        id: c.id, name: c.name, email: c.email,
        totalOrders: c.orders.length,
        totalRevenue: Math.round(c.orders.reduce((s, o) => s + o.total, 0)),
      }));
      if (p.sortBy === 'revenue') enriched.sort((a, b) => b.totalRevenue - a.totalRevenue);
      if (p.sortBy === 'orders')  enriched.sort((a, b) => b.totalOrders  - a.totalOrders);
      return JSON.stringify(enriched);
    }

    case 'get_analytics': {
      const p = tool.input as GetAnalyticsParams;
      const orders = await db.order.findMany({
        where: { storeId: store.id, ...buildDateFilter(p.period) },
        include: { items: { include: { product: true } } },
      });
      const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
      const productMap = new Map<string, { nameKey: string; qty: number; revenue: number }>();
      for (const o of orders) {
        for (const item of o.items) {
          const e = productMap.get(item.productId) ?? { nameKey: item.product.nameKey, qty: 0, revenue: 0 };
          e.qty += item.quantity;
          e.revenue += item.price * item.quantity;
          productMap.set(item.productId, e);
        }
      }
      const topProducts = [...productMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
      return JSON.stringify({
        period: p.period ?? 'month',
        totalOrders: orders.length,
        totalRevenue: Math.round(totalRevenue),
        avgOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
        topProducts,
        byStatus: {
          PENDING:   orders.filter((o) => o.status === 'PENDING').length,
          CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
          SHIPPED:   orders.filter((o) => o.status === 'SHIPPED').length,
          DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
          CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
        },
      });
    }

    case 'create_promotion': {
      const p = tool.input as CreatePromoParams;
      const promo = await db.promotion.create({
        data: {
          type: p.type as PromoType,
          title: p.title,
          description: p.description ?? null,
          discountPercent: p.discountPercent ?? null,
          productIds: p.productIds ?? [],
          categoryIds: [],
          startsAt: new Date(),
          endsAt: p.endsAt ? new Date(p.endsAt) : null,
          active: true,
          storeId: store.id,
        },
      });
      return `Promotion created: "${promo.title}" (${promo.type}, id: ${promo.id})`;
    }

    case 'search_knowledge': {
      const p = tool.input as SearchKnowledgeParams;
      const entries = await db.knowledgeEntry.findMany({
        where: {
          storeId: store.id,
          OR: [
            { title:   { contains: p.query, mode: 'insensitive' } },
            { content: { contains: p.query, mode: 'insensitive' } },
          ],
        },
      });
      return entries.length > 0
        ? entries.map((e) => `**${e.title}**\n${e.content}`).join('\n\n')
        : `Nothing found for: "${p.query}"`;
    }

    default:
      return `Unknown tool: ${tool.name}`;
  }
}

// ─── Claude API types ──────────────────────────────────────────────────────
interface TextBlock      { type: 'text'; text: string }
interface ToolUseBlock   { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
interface ToolResultBlock { type: 'tool_result'; tool_use_id: string; content: string }
type ContentBlock = TextBlock | ToolUseBlock;
type MessageContent = string | ContentBlock[] | ToolResultBlock[];

interface ClaudeMessage   { role: 'user' | 'assistant'; content: MessageContent }
interface ClaudeResponse  { stop_reason: string; content: ContentBlock[] }

// ─── POST /api/admin/chat ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  const { message, history } = (await req.json()) as {
    message: string;
    history?: ClaudeMessage[];
  };

  const SYSTEM = `You are an AI assistant for the ElectroMarket online store admin panel.
You have access to the store database via tools.
IMPORTANT: Detect the language of the user's message and reply in the SAME language.
If the user writes in Russian — reply in Russian.
If the user writes in English — reply in English.
If the user writes in Ukrainian — reply in Ukrainian.
Be concise, helpful, and specific. Always show actual numbers, names, and prices from the database.
Don't explain what you're doing — just do it and present the results clearly.`;

  const messages: ClaudeMessage[] = [
    ...(history ?? []),
    { role: 'user', content: message },
  ];

  const callClaude = (msgs: ClaudeMessage[]) =>
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: SYSTEM,
        tools: TOOLS,
        messages: msgs,
      }),
    }).then((r) => r.json() as Promise<ClaudeResponse>);

  const toolsUsed: string[] = [];
  let result = await callClaude(messages);

  // Tool-use loop — Claude may chain multiple tool calls
  while (result.stop_reason === 'tool_use') {
    const toolBlocks = result.content.filter((b): b is ToolUseBlock => b.type === 'tool_use');
    const toolResults: ToolResultBlock[] = [];

    for (const block of toolBlocks) {
      toolsUsed.push(block.name);
      const output = await executeTool({ name: block.name, input: block.input } as ToolParams);
      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: output });
    }

    messages.push({ role: 'assistant', content: result.content });
    messages.push({ role: 'user', content: toolResults });
    result = await callClaude(messages);
  }

  const textBlock = result.content.find((b): b is TextBlock => b.type === 'text');
  return Response.json({
    response: textBlock?.text ?? 'No response from AI.',
    toolsUsed,
    updatedHistory: messages,
  });
}
