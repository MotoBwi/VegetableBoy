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
    const { name, phone, image, zoneId, block, building, flat, active } = body;

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
    if (block !== undefined) data.block = block.trim().slice(0, 50);
    if (building !== undefined) data.building = building.trim().slice(0, 50);
    if (flat !== undefined) data.flat = flat.trim().slice(0, 50);
    if (active !== undefined) data.active = active;

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      include: { zone: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user!" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await prisma.$transaction([
      prisma.order.deleteMany({ where: { userId: Number(id) } }),
      prisma.user.delete({ where: { id: Number(id) } }),
    ]);
    return NextResponse.json({ message: "User deleted!" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user!" }, { status: 500 });
  }
}
