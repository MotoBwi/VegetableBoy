import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromCookie } from "@/lib/jwt";

async function requireAuth(request) {
  const token = getTokenFromCookie(request);
  if (!token) return { error: "Login required!", status: 401 };
  const decoded = await verifyToken(token);
  if (!decoded) return { error: "Session expired!", status: 401 };
  return null;
}

const ALLOWED_STATUSES = ["pending", "delivered", "failed"];
const ALLOWED_PAYMENTS = ["cash", "online", null];
const ALLOWED_VARIANTS = ["250g", "500g", "1kg"];

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          user: true,
          zone: true,
          items: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count(),
    ]);

    const formatted = orders.map((o) => ({
      id: o.id,
      user: o.user.name,
      zone: o.zone.name,
      items: o.items.map((item) => ({
        name: item.product.name,
        image: item.product.image,
        variant: item.variant,
        qty: item.qty,
      })),
      total: o.total,
      status: o.status,
      payment: o.payment,
      createdAt: o.createdAt,
    }));

    return NextResponse.json({ orders: formatted, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders!" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id, userId, zoneId, status, payment, items } = await request.json();

    if (!id || typeof id !== "string" || id.trim().length === 0 || id.trim().length > 50) {
      return NextResponse.json({ error: "Order ID is required and must be ≤50 chars!" }, { status: 400 });
    }
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json({ error: "Valid userId is required!" }, { status: 400 });
    }
    if (!zoneId || isNaN(Number(zoneId))) {
      return NextResponse.json({ error: "Valid zoneId is required!" }, { status: 400 });
    }
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status!" }, { status: 400 });
    }
    if (payment !== undefined && !ALLOWED_PAYMENTS.includes(payment)) {
      return NextResponse.json({ error: "Invalid payment!" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: "Items must be 1–50 per order!" }, { status: 400 });
    }

    // Validate items and compute total server-side
    let computedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId || isNaN(Number(item.productId))) {
        return NextResponse.json({ error: "Each item must have a valid productId!" }, { status: 400 });
      }
      if (!ALLOWED_VARIANTS.includes(item.variant)) {
        return NextResponse.json({ error: `Invalid variant: ${item.variant}` }, { status: 400 });
      }
      if (!Number.isFinite(item.qty) || item.qty <= 0) {
        return NextResponse.json({ error: "Quantity must be a positive number!" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: Number(item.productId) },
      });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      const price =
        item.variant === "250g" ? product.price250 :
        item.variant === "500g" ? product.price500 :
        product.price1kg;

      computedTotal += price * Number(item.qty);
      validatedItems.push({
        productId: Number(item.productId),
        variant: item.variant,
        qty: Number(item.qty),
      });
    }

    const order = await prisma.order.create({
      data: {
        id: id.trim(),
        userId: Number(userId),
        zoneId: Number(zoneId),
        total: computedTotal,
        status: status || "pending",
        payment: payment || null,
        items: { create: validatedItems },
      },
      include: { items: { include: { product: true } }, user: true, zone: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order!" }, { status: 500 });
  }
}
