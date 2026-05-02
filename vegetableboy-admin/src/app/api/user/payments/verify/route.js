import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import crypto from "crypto";

function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Not logged in!" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Session expired!" }, { status: 401 });
    }

    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment details!" }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature!" }, { status: 400 });
    }

    const paymentAttempt = await prisma.paymentAttempt.findUnique({
      where: { razorpayOrderId },
    });

    if (!paymentAttempt) {
      return NextResponse.json({ error: "Payment attempt not found!" }, { status: 404 });
    }

    if (paymentAttempt.userId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized!" }, { status: 403 });
    }

    if (paymentAttempt.status !== "created") {
      return NextResponse.json({ error: "Payment already processed!" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    // Auto-assign active delivery person for this zone
    let assignedDpId = null;
    const zoneDps = await prisma.zoneDeliveryPerson.findMany({
      where: { zoneId: user.zoneId },
      include: { deliveryPerson: true },
    });
    const activeZoneDp = zoneDps.find(zdp => zdp.deliveryPerson?.active !== false);
    if (activeZoneDp) {
      assignedDpId = activeZoneDp.deliveryPersonId;
    }

    const validatedItems = JSON.parse(paymentAttempt.itemsJson);

    const order = await prisma.order.create({
      data: {
        userId: decoded.userId,
        zoneId: user.zoneId,
        deliveryPersonId: assignedDpId,
        total: paymentAttempt.total,
        deliveryCharge: paymentAttempt.deliveryCharge,
        status: "pending",
        payment: "online",
        items: { create: validatedItems },
      },
      include: {
        zone: true,
        deliveryPerson: true,
        items: true,
      },
    });

    await prisma.paymentAttempt.update({
      where: { id: paymentAttempt.id },
      data: {
        status: "paid",
        razorpayPaymentId,
        razorpaySignature,
        orderId: order.id,
      },
    });

    const productIds = [...new Set(order.items.map(i => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, image: true, price250: true, price500: true, price1kg: true },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    const deliveryCharge = order.deliveryCharge ?? 15;
    const formatted = {
      id: order.id,
      zone: order.zone.name,
      items: order.items.map((item) => {
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
      subtotal: order.total,
      deliveryCharge,
      total: order.total + deliveryCharge,
      status: order.status,
      payment: order.payment,
      createdAt: order.createdAt,
      deliveryPerson: order.deliveryPerson ? order.deliveryPerson.name : null,
    };

    return NextResponse.json({ order: formatted });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Failed to verify payment!" }, { status: 500 });
  }
}
