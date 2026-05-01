import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

async function requireDeliveryAuth(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { error: "Login required!", status: 401 };

  const decoded = await verifyToken(token);
  if (!decoded || !decoded.deliveryPersonId) {
    return { error: "Session expired!", status: 401 };
  }

  const person = await prisma.deliveryPerson.findUnique({
    where: { id: decoded.deliveryPersonId },
    include: { zones: true },
  });
  if (!person) return { error: "Delivery person not found!", status: 404 };
  if (!person.active) return { error: "Account is deactivated!", status: 403 };

  return { person };
}

export async function GET(request) {
  const auth = await requireDeliveryAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const dp = auth.person;
    const zoneIds = dp.zones.map((z) => z.id);

    // Collected amounts from delivered orders
    let cashCollected = 0;
    let onlineCollected = 0;

    if (zoneIds.length > 0) {
      const zoneOrderStats = await prisma.order.groupBy({
        by: ["zoneId", "payment"],
        where: {
          zoneId: { in: zoneIds },
          status: "delivered",
        },
        _sum: { total: true },
      });

      for (const stat of zoneOrderStats) {
        if (stat.payment === "cash") cashCollected += stat._sum.total || 0;
        if (stat.payment === "online") onlineCollected += stat._sum.total || 0;
      }
    }

    // Deposited amounts
    const settlements = await prisma.deliveryPersonSettlement.findMany({
      where: { deliveryPersonId: dp.id },
    });

    const cashDeposited = settlements.reduce((sum, s) => sum + (s.cashAmount || 0), 0);
    const onlineDeposited = settlements.reduce((sum, s) => sum + (s.onlineAmount || 0), 0);

    const netCash = cashCollected - cashDeposited;
    const netOnline = onlineCollected - onlineDeposited;
    let cashPending = 0;
    let onlinePending = 0;
    if (netCash < 0 && netOnline > 0) {
      onlinePending = Math.max(0, netOnline + netCash);
      cashPending = 0;
    } else if (netOnline < 0 && netCash > 0) {
      cashPending = Math.max(0, netCash + netOnline);
      onlinePending = 0;
    } else {
      cashPending = Math.max(0, netCash);
      onlinePending = Math.max(0, netOnline);
    }

    return NextResponse.json({
      person: {
        id: dp.id,
        name: dp.name,
        phone: dp.phone,
        image: dp.image,
        upiId: dp.upiId,
        zones: dp.zones.map((z) => ({ id: z.id, name: z.name })),
      },
      stats: {
        cashCollected,
        onlineCollected,
        cashDeposited,
        onlineDeposited,
        cashPending,
        onlinePending,
        totalPending: cashPending + onlinePending,
      },
    });
  } catch (error) {
    console.error("Get delivery self error:", error);
    return NextResponse.json({ error: "Failed to fetch profile!" }, { status: 500 });
  }
}
