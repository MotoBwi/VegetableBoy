import bcrypt from "bcryptjs";
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

    const [persons, total, orderStatsRaw] = await Promise.all([
      prisma.deliveryPerson.findMany({
        include: { zoneDeliveryPersons: { include: { zone: true } } },
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
      prisma.deliveryPerson.count(),
      prisma.order.findMany({
        where: { deliveryPersonId: { not: null } },
        select: { deliveryPersonId: true, status: true },
      }),
    ]);

    const orderStats = new Map();
    for (const order of orderStatsRaw) {
      if (order.deliveryPersonId) {
        const key = `${order.deliveryPersonId}-${order.status}`;
        orderStats.set(key, (orderStats.get(key) || 0) + 1);
      }
    }

    const enriched = persons.map((p) => {
      const delivered = orderStats.get(`${p.id}-delivered`) || 0;
      const pending = orderStats.get(`${p.id}-pending`) || 0;
      const failed = orderStats.get(`${p.id}-failed`) || 0;
      const { password: _, ...rest } = p;
      return { ...rest, delivered, pending, failed };
    });

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
    const { name, phone, password, image, zoneIds, active } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.trim().length > 100) {
      return NextResponse.json({ error: "Name is required and must be ≤100 chars!" }, { status: 400 });
    }
    if (!phone || typeof phone !== "string" || !/^\d{10}$/.test(phone.trim())) {
      return NextResponse.json({ error: "Valid 10-digit phone is required!" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters!" }, { status: 400 });
    }
    if (!Array.isArray(zoneIds) || zoneIds.length === 0 || zoneIds.some((id) => !id || typeof id !== 'string')) {
      return NextResponse.json({ error: "At least one valid zone is required!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const person = await prisma.deliveryPerson.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        password: hashedPassword,
        image: typeof image === "string" ? image.trim().slice(0, 500) : "",
        zoneDeliveryPersons: {
          create: zoneIds.map((id) => ({
            zone: { connect: { id } },
          })),
        },
        active: typeof active === "boolean" ? active : true,
      },
      include: { zoneDeliveryPersons: { include: { zone: true } } },
    });
    const { password: _p, ...safePerson } = person;
    return NextResponse.json({ ...safePerson, delivered: 0, pending: 0 }, { status: 201 });
  } catch (error) {
    console.error("Create delivery person error:", error);
    return NextResponse.json({ error: "Failed to create delivery person!" }, { status: 500 });
  }
}
