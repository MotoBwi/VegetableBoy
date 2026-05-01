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

    const [zones, total] = await Promise.all([
      prisma.zone.findMany({
        include: {
          _count: { select: { users: true } },
          deliveryPersons: { select: { name: true } },
        },
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
      prisma.zone.count(),
    ]);

    return NextResponse.json({ zones, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get zones error:", error);
    return NextResponse.json({ error: "Failed to fetch zones!" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { name, area } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.trim().length > 50) {
      return NextResponse.json({ error: "Zone name is required and must be ≤50 chars!" }, { status: 400 });
    }
    if (!area || typeof area !== "string" || area.trim().length === 0 || area.trim().length > 200) {
      return NextResponse.json({ error: "Zone area is required and must be ≤200 chars!" }, { status: 400 });
    }

    const zone = await prisma.zone.create({
      data: {
        name: name.trim(),
        area: area.trim(),
      },
    });
    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error("Create zone error:", error);
    return NextResponse.json({ error: "Failed to create zone!" }, { status: 500 });
  }
}
