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

export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const pendingOrders = await prisma.order.findMany({
      where: { status: "pending" },
      include: { zone: true },
    });
    const unassignedOrders = pendingOrders.filter(o => !o.deliveryPersonId);

    let assignedCount = 0;
    const results = [];

    for (const order of unassignedOrders) {
      const zoneDps = await prisma.zoneDeliveryPerson.findMany({
        where: { zoneId: order.zoneId },
        include: { deliveryPerson: true },
      });
      const activeZoneDp = zoneDps.find(zdp => zdp.deliveryPerson?.active !== false);

      if (activeZoneDp) {
        await prisma.order.update({
          where: { id: order.id },
          data: { deliveryPersonId: activeZoneDp.deliveryPersonId },
        });
        assignedCount++;
        results.push({
          orderId: order.id,
          zone: order.zone.name,
          assignedTo: activeZoneDp.deliveryPerson.name,
        });
      }
    }

    return NextResponse.json({
      assignedCount,
      unassignedRemaining: unassignedOrders.length - assignedCount,
      results,
    });
  } catch (error) {
    console.error("Auto-assign error:", error);
    return NextResponse.json({ error: "Failed to auto-assign orders!" }, { status: 500 });
  }
}
