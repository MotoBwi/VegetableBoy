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

const ALLOWED_STATUSES = ["pending", "delivered", "failed"];
const ALLOWED_PAYMENTS = ["cash", "online", null];

export async function PUT(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, payment, deliveryPersonId } = body;

    const data = {};
    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status!" }, { status: 400 });
      }
      data.status = status;
    }
    if (payment !== undefined) {
      if (!ALLOWED_PAYMENTS.includes(payment)) {
        return NextResponse.json({ error: "Invalid payment!" }, { status: 400 });
      }
      data.payment = payment;
    }
    if (deliveryPersonId !== undefined) {
      if (deliveryPersonId === null) {
        data.deliveryPersonId = null;
      } else if (typeof deliveryPersonId === "string" && deliveryPersonId.length > 0) {
        const dp = await prisma.deliveryPerson.findUnique({ where: { id: deliveryPersonId } });
        if (!dp) {
          return NextResponse.json({ error: "Delivery person not found!" }, { status: 400 });
        }
        data.deliveryPersonId = deliveryPersonId;
      } else {
        return NextResponse.json({ error: "Invalid deliveryPersonId!" }, { status: 400 });
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data,
      include: { user: true, zone: true, deliveryPerson: true, items: { include: { product: true } } },
    });
    const deliveryCharge = order.deliveryCharge ?? 15;
    const { password: _, ...safeDeliveryPerson } = order.deliveryPerson || {};
    return NextResponse.json({
      ...order,
      deliveryPerson: safeDeliveryPerson,
      subtotal: order.total,
      deliveryCharge,
      total: order.total + deliveryCharge,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Failed to update order!" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ message: "Order deleted!" });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json({ error: "Failed to delete order!" }, { status: 500 });
  }
}
