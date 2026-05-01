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

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        include: { zone: true },
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({ users, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Failed to fetch users!" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { name, phone, image, zoneId, block, building, flat, active } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.trim().length > 100) {
      return NextResponse.json({ error: "Name is required and must be ≤100 chars!" }, { status: 400 });
    }
    if (!phone || typeof phone !== "string" || !/^\d{10}$/.test(phone.trim())) {
      return NextResponse.json({ error: "Valid 10-digit phone is required!" }, { status: 400 });
    }
    if (!zoneId || isNaN(Number(zoneId))) {
      return NextResponse.json({ error: "Valid zone is required!" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        image: typeof image === "string" ? image.trim().slice(0, 500) : "",
        zoneId: Number(zoneId),
        block: typeof block === "string" ? block.trim().slice(0, 50) : "",
        building: typeof building === "string" ? building.trim().slice(0, 50) : "",
        flat: typeof flat === "string" ? flat.trim().slice(0, 50) : "",
        active: typeof active === "boolean" ? active : true,
      },
      include: { zone: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create user!" }, { status: 500 });
  }
}
