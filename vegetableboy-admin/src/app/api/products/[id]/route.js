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
    const { name, image, category, available, price250, price500, price1kg } = body;

    const data = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (trimmed.length > 100) return NextResponse.json({ error: "Name must be ≤100 chars!" }, { status: 400 });
      data.name = trimmed;
    }
    if (image !== undefined) data.image = image.trim().slice(0, 500);
    if (category !== undefined) {
      const trimmed = category.trim();
      if (trimmed.length > 50) return NextResponse.json({ error: "Category must be ≤50 chars!" }, { status: 400 });
      data.category = trimmed;
    }
    if (available !== undefined) data.available = available;
    if (price250 !== undefined) {
      const val = Number(price250);
      if (!Number.isFinite(val) || val < 0 || val > 100000) {
        return NextResponse.json({ error: "price250 must be between 0 and 100000!" }, { status: 400 });
      }
      data.price250 = val;
    }
    if (price500 !== undefined) {
      const val = Number(price500);
      if (!Number.isFinite(val) || val < 0 || val > 100000) {
        return NextResponse.json({ error: "price500 must be between 0 and 100000!" }, { status: 400 });
      }
      data.price500 = val;
    }
    if (price1kg !== undefined) {
      const val = Number(price1kg);
      if (!Number.isFinite(val) || val < 0 || val > 100000) {
        return NextResponse.json({ error: "price1kg must be between 0 and 100000!" }, { status: 400 });
      }
      data.price1kg = val;
    }

    const product = await prisma.product.update({
      where: { id: id },
      data,
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product!" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const orderItems = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItems > 0) {
      return NextResponse.json(
        { error: "Cannot delete product with existing orders!" },
        { status: 400 }
      );
    }
    await prisma.product.delete({ where: { id: id } });
    return NextResponse.json({ message: "Product deleted!" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product!" }, { status: 500 });
  }
}
