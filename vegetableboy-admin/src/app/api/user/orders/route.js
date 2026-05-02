import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Not logged in!" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Session expired!" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      include: {
        zone: true,
        deliveryPerson: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const productIds = [...new Set(orders.flatMap(o => o.items.map(i => i.productId)))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, image: true, price250: true, price500: true, price1kg: true },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    const formatted = orders.map((o) => {
      const deliveryCharge = o.deliveryCharge ?? 15;
      return {
        id: o.id,
        zone: o.zone.name,
        items: o.items.map((item) => {
          const prod = productMap.get(item.productId);
          return {
            name: prod?.name || `Product ${item.productId.slice(-4)}`,
            image: prod?.image || "",
            variant: item.variant,
            qty: item.qty,
            price: prod
              ? item.variant === "250g"
                ? prod.price250
                : item.variant === "500g"
                ? prod.price500
                : prod.price1kg
              : 0,
          };
        }),
        subtotal: o.total,
        deliveryCharge,
        total: o.total + deliveryCharge,
        status: o.status,
        payment: o.payment,
        createdAt: o.createdAt,
        deliveryPerson: o.deliveryPerson ? o.deliveryPerson.name : null,
      };
    });

    // Fetch failed payment attempts for this user
    const failedPayments = await prisma.paymentAttempt.findMany({
      where: { userId: decoded.userId, status: "failed" },
      include: { zone: true },
      orderBy: { createdAt: "desc" },
    });

    const failedProductIds = [...new Set(failedPayments.flatMap(fp => {
      try {
        return JSON.parse(fp.itemsJson).map(i => i.productId);
      } catch {
        return [];
      }
    }))];
    const failedProducts = await prisma.product.findMany({
      where: { id: { in: failedProductIds } },
      select: { id: true, name: true, image: true, price250: true, price500: true, price1kg: true },
    });
    const failedProductMap = new Map(failedProducts.map(p => [p.id, p]));

    const formattedFailed = failedPayments.map((fp) => {
      let items = [];
      try {
        items = JSON.parse(fp.itemsJson);
      } catch {
        items = [];
      }
      const deliveryCharge = fp.deliveryCharge ?? 15;
      return {
        id: fp.id,
        zone: fp.zone?.name || "",
        items: items.map((item) => {
          const prod = failedProductMap.get(item.productId);
          return {
            name: prod?.name || `Product ${item.productId.slice(-4)}`,
            image: prod?.image || "",
            variant: item.variant,
            qty: item.qty,
            price: prod
              ? item.variant === "250g"
                ? prod.price250
                : item.variant === "500g"
                ? prod.price500
                : prod.price1kg
              : 0,
          };
        }),
        subtotal: fp.total,
        deliveryCharge,
        total: fp.total + deliveryCharge,
        status: "payment_failed",
        payment: null,
        createdAt: fp.createdAt,
        deliveryPerson: null,
        razorpayOrderId: fp.razorpayOrderId,
        failureReason: fp.failureReason,
      };
    });

    const combined = [...formatted, ...formattedFailed].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return NextResponse.json({ orders: combined });
  } catch (error) {
    console.error("Get user orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders!" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Not logged in!" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Session expired!" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: "Items must be 1–50 per order!" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    // Auto-assign active delivery person for this zone
    let assignedDpId = null;
    const zoneDps = await prisma.zoneDeliveryPerson.findMany({
      where: { zoneId: user.zoneId },
      include: { deliveryPerson: true },
    });
    const activeZoneDp = zoneDps.find(zdp => zdp.deliveryPerson?.active !== false);
    if (activeZoneDp) {
      assignedDpId = activeZoneDp.deliveryPersonId;
    }

    const ALLOWED_VARIANTS = ["250g", "500g", "1kg"];
    let computedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId || typeof item.productId !== "string") {
        return NextResponse.json({ error: "Each item must have a valid productId!" }, { status: 400 });
      }
      if (!ALLOWED_VARIANTS.includes(item.variant)) {
        return NextResponse.json({ error: `Invalid variant: ${item.variant}` }, { status: 400 });
      }
      if (!Number.isFinite(item.qty) || item.qty <= 0) {
        return NextResponse.json({ error: "Quantity must be a positive number!" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      const price =
        item.variant === "250g" ? product.price250 :
        item.variant === "500g" ? product.price500 :
        product.price1kg;

      computedTotal += price * Number(item.qty);
      validatedItems.push({
        productId: item.productId,
        variant: item.variant,
        qty: Number(item.qty),
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: decoded.userId,
        zoneId: user.zoneId,
        deliveryPersonId: assignedDpId,
        total: computedTotal,
        deliveryCharge: 15,
        status: "pending",
        payment: null,
        items: { create: validatedItems },
      },
      include: {
        zone: true,
        deliveryPerson: true,
      },
    });

    return NextResponse.json({
      order: {
        id: order.id,
        zone: order.zone.name,
        deliveryPerson: order.deliveryPerson?.name || null,
        subtotal: order.total,
        deliveryCharge: order.deliveryCharge,
        total: order.total + order.deliveryCharge,
        status: order.status,
        payment: order.payment,
        createdAt: order.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create user order error:", error);
    return NextResponse.json({ error: "Failed to place order!" }, { status: 500 });
  }
}
