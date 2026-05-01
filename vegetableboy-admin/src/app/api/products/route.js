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

    const [products, total] = await Promise.all([
      prisma.product.findMany({ orderBy: { id: "asc" }, skip, take: limit }),
      prisma.product.count(),
    ]);

    return NextResponse.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Failed to fetch products!" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { name, image, category, available, price250, price500, price1kg } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.trim().length > 100) {
      return NextResponse.json({ error: "Product name is required and must be ≤100 chars!" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        image: typeof image === "string" ? image.trim().slice(0, 500) : "",
        category: typeof category === "string" ? category.trim().slice(0, 50) : "Staple",
        available: typeof available === "boolean" ? available : true,
        price250: typeof price250 === "number" && price250 >= 0 ? price250 : 0,
        price500: typeof price500 === "number" && price500 >= 0 ? price500 : 0,
        price1kg: typeof price1kg === "number" && price1kg >= 0 ? price1kg : 0,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product!" }, { status: 500 });
  }
}
