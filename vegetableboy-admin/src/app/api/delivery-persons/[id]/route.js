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

export async function PUT(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, image, zoneId, active } = body;

    const data = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (trimmed.length > 100) return NextResponse.json({ error: "Name must be ≤100 chars!" }, { status: 400 });
      data.name = trimmed;
    }
    if (phone !== undefined) {
      if (!/^\d{10}$/.test(phone.trim())) {
        return NextResponse.json({ error: "Valid 10-digit phone required!" }, { status: 400 });
      }
      data.phone = phone.trim();
    }
    if (image !== undefined) data.image = image.trim().slice(0, 500);
    if (zoneId !== undefined) data.zoneId = Number(zoneId);
    if (active !== undefined) data.active = active;

    const person = await prisma.deliveryPerson.update({
      where: { id: Number(id) },
      data,
      include: { zone: true },
    });
    return NextResponse.json(person);
  } catch (error) {
    console.error("Update delivery person error:", error);
    return NextResponse.json({ error: "Failed to update delivery person!" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await prisma.deliveryPerson.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Delivery person deleted!" });
  } catch (error) {
    console.error("Delete delivery person error:", error);
    return NextResponse.json({ error: "Failed to delete delivery person!" }, { status: 500 });
  }
}
