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
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { status: "delivered", payment: "online" },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { status: "pending" },
        _sum: { total: true },
      }),
    ]);

    const totalRevenue = (deliveredCashAgg._sum.total || 0) + (deliveredOnlineAgg._sum.total || 0);
    const totalCash = deliveredCashAgg._sum.total || 0;
    const totalOnline = deliveredOnlineAgg._sum.total || 0;
    const pendingRevenue = pendingAgg._sum.total || 0;

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
        _sum: { total: true },
      });
      salesTrend.push({ day: dayName, sales: agg._sum.total || 0 });
    }

    const paymentData = [
      { name: "Cash", value: totalCash },
      { name: "Online", value: totalOnline },
    ];

    const zoneRevenueRaw = await prisma.order.groupBy({
      by: ["zoneId"],
      where: { status: "delivered" },
      _sum: { total: true },
      _count: { id: true },
    });

    const zones = await prisma.zone.findMany();
    const zoneMap = new Map(zones.map((z) => [z.id, z.name]));
    const zoneRevenue = zoneRevenueRaw.map((z) => ({
      name: zoneMap.get(z.zoneId) || `Zone ${z.zoneId}`,
      revenue: z._sum.total || 0,
      orders: z._count.id || 0,
    }));

    const deliveryStatsRaw = await prisma.order.groupBy({
      by: ["zoneId", "status"],
      _count: { id: true },
    });

    const persons = await prisma.deliveryPerson.findMany({ include: { zones: true } });
    const zoneStats = new Map();
    for (const stat of deliveryStatsRaw) {
      const key = `${stat.zoneId}-${stat.status}`;
      zoneStats.set(key, stat._count.id);
    }

    const deliveryPerf = persons.map((dp) => {
      const zoneIds = dp.zones.map((z) => z.id);
      const deliveredCount = zoneIds.reduce((sum, zid) => sum + (zoneStats.get(`${zid}-delivered`) || 0), 0);
      const pendingCount = zoneIds.reduce((sum, zid) => sum + (zoneStats.get(`${zid}-pending`) || 0), 0);
      return {
        name: dp.name.split(" ")[0],
        delivered: deliveredCount,
        pending: pendingCount,
      };
    });

    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ["productId"],
      _count: { id: true },
      _sum: { qty: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    });

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
        orders: p._count.id,
        qty: p._sum.qty || 0,
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
