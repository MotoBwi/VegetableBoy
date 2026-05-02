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
    const [deliveredCashAgg, deliveredOnlineAgg, pendingAgg] = await Promise.all([
      prisma.order.aggregate({
        where: { status: "delivered", payment: "cash" },
        _sum: { total: true, deliveryCharge: true },
      }),
      prisma.order.aggregate({
        where: { status: "delivered", payment: "online" },
        _sum: { total: true, deliveryCharge: true },
      }),
      prisma.order.aggregate({
        where: { status: "pending" },
        _sum: { total: true, deliveryCharge: true },
      }),
    ]);

    const totalRevenue = (deliveredCashAgg._sum.total || 0) + (deliveredCashAgg._sum.deliveryCharge || 0) + (deliveredOnlineAgg._sum.total || 0) + (deliveredOnlineAgg._sum.deliveryCharge || 0);
    const totalCash = (deliveredCashAgg._sum.total || 0) + (deliveredCashAgg._sum.deliveryCharge || 0);
    const totalOnline = (deliveredOnlineAgg._sum.total || 0) + (deliveredOnlineAgg._sum.deliveryCharge || 0);
    const pendingRevenue = (pendingAgg._sum.total || 0) + (pendingAgg._sum.deliveryCharge || 0);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const salesTrend = [];
    const today = new Date();
    const dayStartOffsets = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      dayStartOffsets.push({ dayName: days[d.getDay()], dayStart, dayEnd });
    }

    for (const { dayName, dayStart, dayEnd } of dayStartOffsets) {
      const agg = await prisma.order.aggregate({
        where: {
          status: "delivered",
          createdAt: { gte: dayStart, lte: dayEnd },
        },
        _sum: { total: true, deliveryCharge: true },
      });
      salesTrend.push({ day: dayName, sales: (agg._sum.total || 0) + (agg._sum.deliveryCharge || 0) });
    }

    const paymentData = [
      { name: "Cash", value: totalCash },
      { name: "Online", value: totalOnline },
    ];

    const deliveredOrdersForZones = await prisma.order.findMany({
      where: { status: "delivered" },
      select: { zoneId: true, total: true, deliveryCharge: true },
    });

    const zoneRevenueMap = new Map();
    for (const order of deliveredOrdersForZones) {
      const current = zoneRevenueMap.get(order.zoneId) || { revenue: 0, orders: 0 };
      current.revenue += (order.total || 0) + (order.deliveryCharge || 0);
      current.orders += 1;
      zoneRevenueMap.set(order.zoneId, current);
    }

    const zones = await prisma.zone.findMany();
    const zoneMap = new Map(zones.map((z) => [z.id, z.name]));
    const zoneRevenue = Array.from(zoneRevenueMap.entries()).map(([zoneId, data]) => ({
      name: zoneMap.get(zoneId) || `Zone ${zoneId}`,
      revenue: data.revenue,
      orders: data.orders,
    }));

    const allOrdersForStats = await prisma.order.findMany({
      where: { deliveryPersonId: { not: null } },
      select: { deliveryPersonId: true, status: true },
    });

    const persons = await prisma.deliveryPerson.findMany({ include: { zoneDeliveryPersons: { include: { zone: true } } } });
    const dpStats = new Map();
    for (const order of allOrdersForStats) {
      if (order.deliveryPersonId) {
        const key = `${order.deliveryPersonId}-${order.status}`;
        dpStats.set(key, (dpStats.get(key) || 0) + 1);
      }
    }

    const deliveryPerf = persons.map((dp) => {
      const deliveredCount = dpStats.get(`${dp.id}-delivered`) || 0;
      const pendingCount = dpStats.get(`${dp.id}-pending`) || 0;
      const failedCount = dpStats.get(`${dp.id}-failed`) || 0;
      return {
        name: dp.name.split(" ")[0],
        delivered: deliveredCount,
        pending: pendingCount,
        failed: failedCount,
      };
    });

    const allOrderItems = await prisma.orderItem.findMany({
      select: { productId: true, qty: true },
    });

    const productStats = new Map();
    for (const item of allOrderItems) {
      const current = productStats.get(item.productId) || { orders: 0, qty: 0 };
      current.orders += 1;
      current.qty += item.qty || 0;
      productStats.set(item.productId, current);
    }

    const topProductsRaw = Array.from(productStats.entries())
      .map(([productId, stats]) => ({ productId, ...stats }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 20);

    const productIds = topProductsRaw.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const topProducts = topProductsRaw.map((p) => {
      const prod = productMap.get(p.productId);
      return {
        name: prod?.name || `Product ${p.productId}`,
        image: prod?.image || "",
        orders: p.orders,
        qty: p.qty,
      };
    });

    return NextResponse.json({
      totalRevenue,
      totalCash,
      totalOnline,
      pendingRevenue,
      salesTrend,
      paymentData,
      zoneRevenue,
      deliveryPerf,
      topProducts,
      deliveredOrders: await prisma.order.count({ where: { status: "delivered" } }),
    });
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Failed to generate reports!" }, { status: 500 });
  }
}
