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
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const [persons, total, zoneStatsRaw] = await Promise.all([
      prisma.deliveryPerson.findMany({
        include: { zone: true },
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
      prisma.deliveryPerson.count(),
      prisma.order.groupBy({
        by: ["zoneId", "status"],
        _count: { id: true },
      }),
    ]);

    const zoneStats = new Map();
    for (const stat of zoneStatsRaw) {
      zoneStats.set(`${stat.zoneId}-${stat.status}`, stat._count.id);
    }

    const enriched = persons.map((p) => ({
      ...p,
      delivered: zoneStats.get(`${p.zoneId}-delivered`) || 0,
      pending: zoneStats.get(`${p.zoneId}-pending`) || 0,
    }));

    return NextResponse.json({ persons: enriched, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get delivery persons error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery persons!" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { name, phone, image, zoneId, active } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.trim().length > 100) {
      return NextResponse.json({ error: "Name is required and must be ≤100 chars!" }, { status: 400 });
    }
    if (!phone || typeof phone !== "string" || !/^\d{10}$/.test(phone.trim())) {
      return NextResponse.json({ error: "Valid 10-digit phone is required!" }, { status: 400 });
    }
    if (!zoneId || isNaN(Number(zoneId))) {
      return NextResponse.json({ error: "Valid zone is required!" }, { status: 400 });
    }

    const person = await prisma.deliveryPerson.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        image: typeof image === "string" ? image.trim().slice(0, 500) : "",
        zoneId: Number(zoneId),
        active: typeof active === "boolean" ? active : true,
      },
      include: { zone: true },
    });
    return NextResponse.json({ ...person, delivered: 0, pending: 0 }, { status: 201 });
  } catch (error) {
    console.error("Create delivery person error:", error);
    return NextResponse.json({ error: "Failed to create delivery person!" }, { status: 500 });
  }
}
