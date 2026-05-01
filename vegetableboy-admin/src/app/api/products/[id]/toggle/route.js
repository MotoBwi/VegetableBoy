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
    await prisma.$executeRaw`UPDATE Product SET available = NOT available WHERE id = ${numId}`;
    const updated = await prisma.product.findUnique({ where: { id: numId } });
    if (!updated) {
      return NextResponse.json({ error: "Product not found!" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Toggle product error:", error);
    return NextResponse.json({ error: "Failed to toggle product!" }, { status: 500 });
  }
}
