import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

const ALLOWED_STATUSES = ["pending", "delivered", "failed"];
const ALLOWED_PAYMENTS = ["cash", "online", null];

async function requireDeliveryAuth(request) {
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

export async function PATCH(request, { params }) {
  const auth = await requireDeliveryAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, payment } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Valid order ID is required!" }, { status: 400 });
    }
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status!" }, { status: 400 });
    }
    if (payment !== undefined && !ALLOWED_PAYMENTS.includes(payment)) {
      return NextResponse.json({ error: "Invalid payment!" }, { status: 400 });
    }

    const dp = auth.person;
    const zoneIds = dp.zoneDeliveryPersons.map((zdp) => zdp.zone).map((z) => z.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { zone: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found!" }, { status: 404 });
    }
    // If order is assigned to another delivery person, deny access
    if (order.deliveryPersonId && order.deliveryPersonId !== dp.id) {
      return NextResponse.json({ error: "Order assigned to another delivery person!" }, { status: 403 });
    }
    // If order is unassigned, only allow updates within own zones
    if (!order.deliveryPersonId && !zoneIds.includes(order.zoneId)) {
      return NextResponse.json({ error: "Not authorized for this order!" }, { status: 403 });
    }

    const data = {};
    if (status) data.status = status;
    if (payment !== undefined) data.payment = payment;
    // If order was unassigned, auto-assign to this delivery person
    if (!order.deliveryPersonId) {
      data.deliveryPersonId = dp.id;
    }

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: {
        user: true,
        zone: true,
        items: true,
      },
    });

    const productIds = [...new Set(updated.items.map(i => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, image: true, price250: true, price500: true, price1kg: true },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    const deliveryCharge = updated.deliveryCharge ?? 15;
    const formatted = {
      id: updated.id,
      user: {
        name: updated.user.name,
        phone: updated.user.phone,
        address: `${updated.user.building}, ${updated.user.block}, ${updated.zone.name}`,
      },
      zone: updated.zone.name,
      items: updated.items.map((item) => {
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
      subtotal: updated.total,
      deliveryCharge,
      total: updated.total + deliveryCharge,
      status: updated.status,
      payment: updated.payment,
      createdAt: updated.createdAt,
    };

    return NextResponse.json({ order: formatted });
  } catch (error) {
    console.error("Update delivery order status error:", error);
    return NextResponse.json({ error: "Failed to update order!" }, { status: 500 });
  }
}
