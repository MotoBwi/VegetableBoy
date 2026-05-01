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
    const personId = searchParams.get("personId");

    const where = {};
    if (personId) where.deliveryPersonId = Number(personId);

    const settlements = await prisma.deliveryPersonSettlement.findMany({
      where,
      include: { deliveryPerson: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ settlements });
  } catch (error) {
    console.error("Get settlements error:", error);
    return NextResponse.json({ error: "Failed to fetch settlements!" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { deliveryPersonId, date, cashAmount, onlineAmount, notes } = body;

    if (!deliveryPersonId || isNaN(Number(deliveryPersonId))) {
      return NextResponse.json({ error: "Valid delivery person is required!" }, { status: 400 });
    }
    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Valid date (YYYY-MM-DD) is required!" }, { status: 400 });
    }

    const settlement = await prisma.deliveryPersonSettlement.create({
      data: {
        deliveryPersonId: Number(deliveryPersonId),
        date,
        cashAmount: Number(cashAmount) || 0,
        onlineAmount: Number(onlineAmount) || 0,
        notes: typeof notes === "string" ? notes.trim().slice(0, 200) : "",
      },
      include: { deliveryPerson: true },
    });

    return NextResponse.json(settlement, { status: 201 });
  } catch (error) {
    console.error("Create settlement error:", error);
    return NextResponse.json({ error: "Failed to create settlement!" }, { status: 500 });
  }
}
