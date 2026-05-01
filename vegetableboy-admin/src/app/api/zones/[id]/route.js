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
    const { name, area } = body;

    const data = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (trimmed.length > 50) return NextResponse.json({ error: "Name must be ≤50 chars!" }, { status: 400 });
      data.name = trimmed;
    }
    if (area !== undefined) {
      const trimmed = area.trim();
      if (trimmed.length > 200) return NextResponse.json({ error: "Area must be ≤200 chars!" }, { status: 400 });
      data.area = trimmed;
    }

    const zone = await prisma.zone.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(zone);
  } catch (error) {
    console.error("Update zone error:", error);
    return NextResponse.json({ error: "Failed to update zone!" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await prisma.zone.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Zone deleted!" });
  } catch (error) {
    console.error("Delete zone error:", error);
    return NextResponse.json({ error: "Failed to delete zone!" }, { status: 500 });
  }
}
