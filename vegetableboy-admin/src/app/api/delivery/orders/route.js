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
    include: { zoneDeliveryPersons: { include: { zone: true } } },
  });
  if (!person) return { error: "Delivery person not found!", status: 404 };
  if (!person.active) return { error: "Account is deactivated!", status: 403 };

  return { person };
}

export async function GET(request) {
  const auth = await requireDeliveryAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const zoneIds = auth.person.zoneDeliveryPersons.map((zdp) => zdp.zone).map((z) => z.id);
    if (zoneIds.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const dpId = auth.person.id;

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { deliveryPersonId: dpId },
          {
            deliveryPersonId: null,
            zoneId: { in: zoneIds },
          },
        ],
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        user: true,
        zone: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const productIds = [...new Set(orders.flatMap(o => o.items.map(i => i.productId)))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, image: true, price250: true, price500: true, price1kg: true },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    const formatted = orders.map((o) => {
      const deliveryCharge = o.deliveryCharge ?? 15;
      return {
        id: o.id,
        user: {
          name: o.user.name,
          phone: o.user.phone,
          address: `${o.user.building}, ${o.user.block}, ${o.zone.name}`,
        },
        zone: o.zone.name,
        items: o.items.map((item) => {
          const prod = productMap.get(item.productId);
          return {
            name: prod?.name || `Product ${item.productId.slice(-4)}`,
            image: prod?.image || "",
            variant: item.variant,
            qty: item.qty,
            price: prod
              ? item.variant === "250g"
                ? prod.price250
                : item.variant === "500g"
                ? prod.price500
                : prod.price1kg
              : 0,
          };
        }),
        subtotal: o.total,
        deliveryCharge,
        total: o.total + deliveryCharge,
        status: o.status,
        payment: o.payment,
        createdAt: o.createdAt,
      };
    });

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error("Get delivery orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders!" }, { status: 500 });
  }
}
