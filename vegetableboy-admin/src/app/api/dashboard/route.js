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

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const [
      totalOrders,
      delivered,
      pending,
      failed,
      cashAgg,
      onlineAgg,
      persons,
      zones,
      recentOrdersRaw,
      failedPayments,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "delivered" } }),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { status: "failed" } }),
      prisma.order.aggregate({
        where: { status: "delivered", payment: "cash" },
        _sum: { total: true, deliveryCharge: true },
      }),
      prisma.order.aggregate({
        where: { status: "delivered", payment: "online" },
        _sum: { total: true, deliveryCharge: true },
      }),
      prisma.deliveryPerson.findMany({ include: { zoneDeliveryPersons: { include: { zone: true } } } }),
      prisma.zone.findMany(),
      prisma.order.findMany({
        include: { user: true, zone: true, items: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.paymentAttempt.count({ where: { status: "failed" } }),
    ]);

    const allOrders = await prisma.order.findMany({
      where: { deliveryPersonId: { not: null } },
      select: { deliveryPersonId: true, status: true },
    });

    const dpStatsMap = new Map();
    for (const order of allOrders) {
      if (order.deliveryPersonId) {
        const key = `${order.deliveryPersonId}-${order.status}`;
        dpStatsMap.set(key, (dpStatsMap.get(key) || 0) + 1);
      }
    }

    const deliveryPersons = persons.map((dp) => {
      const deliveredCount = dpStatsMap.get(`${dp.id}-delivered`) || 0;
      const pendingCount = dpStatsMap.get(`${dp.id}-pending`) || 0;
      const failedCount = dpStatsMap.get(`${dp.id}-failed`) || 0;
      return {
        id: dp.id,
        name: dp.name,
        zone: dp.zoneDeliveryPersons.map((zdp) => zdp.zone.name).join(", "),
        delivered: deliveredCount,
        pending: pendingCount,
        failed: failedCount,
      };
    });

    const productIds = [...new Set(recentOrdersRaw.flatMap(o => o.items.map(i => i.productId)))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, image: true },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    const recentOrders = recentOrdersRaw.map((o) => {
      const dc = o.deliveryCharge ?? 15;
      return {
        id: o.id,
        user: o.user.name,
        zone: o.zone.name,
        items: o.items.map((item) => {
          const prod = productMap.get(item.productId);
          return {
            name: prod?.name || `Product ${item.productId.slice(-4)}`,
            image: prod?.image || "",
            variant: item.variant,
            qty: item.qty,
          };
        }),
        subtotal: o.total,
        deliveryCharge: dc,
        total: o.total + dc,
        status: o.status,
        payment: o.payment,
      };
    });

    return NextResponse.json({
      totalOrders,
      delivered,
      pending,
      failed,
      failedPayments,
      totalCash: (cashAgg._sum.total || 0) + (cashAgg._sum.deliveryCharge || 0),
      totalOnline: (onlineAgg._sum.total || 0) + (onlineAgg._sum.deliveryCharge || 0),
      deliveryPersons,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard!" }, { status: 500 });
  }
}
