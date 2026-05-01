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

export async function PATCH(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const numId = Number(id);
    await prisma.$executeRaw`UPDATE User SET active = NOT active WHERE id = ${numId}`;
    const updated = await prisma.user.findUnique({ where: { id: numId }, include: { zone: true } });
    if (!updated) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Toggle user error:", error);
    return NextResponse.json({ error: "Failed to toggle!" }, { status: 500 });
  }
}
