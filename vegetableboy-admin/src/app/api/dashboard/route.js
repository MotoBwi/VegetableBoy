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
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "delivered" } }),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { status: "failed" } }),
      prisma.order.aggregate({
        where: { status: "delivered", payment: "cash" },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { status: "delivered", payment: "online" },
        _sum: { total: true },
      }),
      prisma.deliveryPerson.findMany({ include: { zones: true } }),
      prisma.zone.findMany(),
      prisma.order.findMany({
        include: { user: true, zone: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const zoneOrderStats = await prisma.order.groupBy({
      by: ["zoneId", "status"],
      _count: { id: true },
    });

    const zoneStatsMap = new Map();
    for (const stat of zoneOrderStats) {
      const key = `${stat.zoneId}-${stat.status}`;
      zoneStatsMap.set(key, stat._count.id);
    }

    const deliveryPersons = persons.map((dp) => {
      const zoneIds = dp.zones.map((z) => z.id);
      const deliveredCount = zoneIds.reduce((sum, zid) => sum + (zoneStatsMap.get(`${zid}-delivered`) || 0), 0);
      const pendingCount = zoneIds.reduce((sum, zid) => sum + (zoneStatsMap.get(`${zid}-pending`) || 0), 0);
      return {
        id: dp.id,
        name: dp.name,
        zone: dp.zones.map((z) => z.name).join(", "),
        delivered: deliveredCount,
        pending: pendingCount,
      };
    });

    const recentOrders = recentOrdersRaw.map((o) => ({
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
    }));

    return NextResponse.json({
      totalOrders,
      delivered,
      pending,
      failed,
      totalCash: cashAgg._sum.total || 0,
      totalOnline: onlineAgg._sum.total || 0,
      deliveryPersons,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard!" }, { status: 500 });
  }
}
