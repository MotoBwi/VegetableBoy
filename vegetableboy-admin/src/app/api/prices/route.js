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
    const products = await prisma.product.findMany({
      where: { available: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Get prices error:", error);
    return NextResponse.json({ error: "Failed to fetch prices!" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { prices } = await request.json(); // { [productId]: perKgPrice }

    const priceKeys = Object.keys(prices);
    if (!prices || typeof prices !== "object" || priceKeys.length === 0 || priceKeys.length > 200) {
      return NextResponse.json({ error: "Prices must contain 1–200 products!" }, { status: 400 });
    }

    const updates = [];
    for (const [productId, perKg] of Object.entries(prices)) {
      const pid = Number(productId);
      if (isNaN(pid) || pid <= 0) {
        return NextResponse.json({ error: `Invalid product ID: ${productId}` }, { status: 400 });
      }
      const price = Number(perKg);
      if (!Number.isFinite(price) || price <= 0 || price > 100000) {
        return NextResponse.json(
          { error: `Invalid price for product ${productId}. Must be between 1 and 100000.` },
          { status: 400 }
        );
      }

      const price250 = Math.round((price * 250) / 1000);
      const price500 = Math.round((price * 500) / 1000);
      const price1kg = Math.round(price);

      updates.push(
        prisma.product.update({
          where: { id: pid },
          data: { price250, price500, price1kg },
        })
      );
    }

    await prisma.$transaction(updates);
    return NextResponse.json({ message: "Prices updated successfully!" });
  } catch (error) {
    console.error("Update prices error:", error);
    return NextResponse.json({ error: "Failed to update prices!" }, { status: 500 });
  }
}
