import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function requireDeliveryAuth(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { error: "Login required!", status: 401 };

  const decoded = await verifyToken(token);
  if (!decoded || !decoded.deliveryPersonId) {
    return { error: "Session expired!", status: 401 };
  }

  const person = await prisma.deliveryPerson.findUnique({
    where: { id: decoded.deliveryPersonId },
    include: { zones: true },
  });
  if (!person) return { error: "Delivery person not found!", status: 404 };
  if (!person.active) return { error: "Account is deactivated!", status: 403 };

  return { person };
}

export async function GET(request) {
  const auth = await requireDeliveryAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const zoneIds = auth.person.zones.map((z) => z.id);
    if (zoneIds.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const orders = await prisma.order.findMany({
      where: {
        zoneId: { in: zoneIds },
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        user: true,
        zone: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      user: {
        name: o.user.name,
        phone: o.user.phone,
        address: `${o.user.building}, ${o.user.block}, ${o.zone.name}`,
      },
      zone: o.zone.name,
      items: o.items.map((item) => ({
        name: item.product.name,
        image: item.product.image,
        variant: item.variant,
        qty: item.qty,
        price:
          item.variant === "250g"
            ? item.product.price250
            : item.variant === "500g"
            ? item.product.price500
            : item.product.price1kg,
      })),
      total: o.total,
      status: o.status,
      payment: o.payment,
      createdAt: o.createdAt,
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error("Get delivery orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders!" }, { status: 500 });
  }
}
