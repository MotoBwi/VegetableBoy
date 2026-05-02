import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { razorpay } from "@/lib/razorpay";

const ALLOWED_VARIANTS = ["250g", "500g", "1kg"];

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
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: "Items must be 1–50 per order!" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { zone: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    let computedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId || typeof item.productId !== "string") {
        return NextResponse.json({ error: "Each item must have a valid productId!" }, { status: 400 });
      }
      if (!ALLOWED_VARIANTS.includes(item.variant)) {
        return NextResponse.json({ error: `Invalid variant: ${item.variant}` }, { status: 400 });
      }
      if (!Number.isFinite(item.qty) || item.qty <= 0) {
        return NextResponse.json({ error: "Quantity must be a positive number!" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      const price =
        item.variant === "250g" ? product.price250 :
        item.variant === "500g" ? product.price500 :
        product.price1kg;

      computedTotal += price * Number(item.qty);
      validatedItems.push({
        productId: item.productId,
        variant: item.variant,
        qty: Number(item.qty),
      });
    }

    const deliveryCharge = 15;
    const amountInPaise = (computedTotal + deliveryCharge) * 100;
    const receipt = `${user.id.slice(-6)}_${Date.now()}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: user.id,
        userName: user.name,
      },
    });

    const paymentAttempt = await prisma.paymentAttempt.create({
      data: {
        userId: user.id,
        zoneId: user.zoneId,
        total: computedTotal,
        deliveryCharge,
        itemsJson: JSON.stringify(validatedItems),
        status: "created",
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentAttemptId: paymentAttempt.id,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return NextResponse.json({ error: "Failed to create payment order!" }, { status: 500 });
  }
}
