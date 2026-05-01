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
    const [persons, zoneOrderStats, settlementsRaw] = await Promise.all([
      prisma.deliveryPerson.findMany({ include: { zones: true } }),
      prisma.order.groupBy({
        by: ["zoneId", "status", "payment"],
        where: { status: "delivered" },
        _sum: { total: true },
      }),
      prisma.deliveryPersonSettlement.findMany(),
    ]);

    const zoneStats = new Map();
    for (const stat of zoneOrderStats) {
      const key = `${stat.zoneId}-${stat.payment || "cash"}`;
      zoneStats.set(key, (zoneStats.get(key) || 0) + (stat._sum.total || 0));
    }

    const personSettlements = new Map();
    for (const s of settlementsRaw) {
      const current = personSettlements.get(s.deliveryPersonId) || { cashDeposited: 0, onlineDeposited: 0 };
      current.cashDeposited += s.cashAmount || 0;
      current.onlineDeposited += s.onlineAmount || 0;
      personSettlements.set(s.deliveryPersonId, current);
    }

    function calculatePending(cashCollected, onlineCollected, cashDeposited, onlineDeposited) {
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
      return { cashPending, onlinePending };
    }

    const report = persons.map((dp) => {
      const zoneIds = dp.zones.map((z) => z.id);
      const cashCollected = zoneIds.reduce((sum, zid) => sum + (zoneStats.get(`${zid}-cash`) || 0), 0);
      const onlineCollected = zoneIds.reduce((sum, zid) => sum + (zoneStats.get(`${zid}-online`) || 0), 0);
      const deposited = personSettlements.get(dp.id) || { cashDeposited: 0, onlineDeposited: 0 };
      const { cashPending, onlinePending } = calculatePending(
        cashCollected, onlineCollected, deposited.cashDeposited, deposited.onlineDeposited
      );

      return {
        id: dp.id,
        name: dp.name,
        phone: dp.phone,
        image: dp.image,
        active: dp.active,
        zones: dp.zones.map((z) => z.name),
        cashCollected,
        onlineCollected,
        totalCollected: cashCollected + onlineCollected,
        cashDeposited: deposited.cashDeposited,
        onlineDeposited: deposited.onlineDeposited,
        totalDeposited: deposited.cashDeposited + deposited.onlineDeposited,
        cashPending,
        onlinePending,
        totalPending: cashPending + onlinePending,
      };
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Payments report error:", error);
    return NextResponse.json({ error: "Failed to generate payments report!" }, { status: 500 });
  }
}
