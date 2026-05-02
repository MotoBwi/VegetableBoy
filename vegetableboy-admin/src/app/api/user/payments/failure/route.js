import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

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
    const { razorpayOrderId, reason } = body;

    if (!razorpayOrderId) {
      return NextResponse.json({ error: "Razorpay order ID required!" }, { status: 400 });
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

    await prisma.paymentAttempt.update({
      where: { id: paymentAttempt.id },
      data: {
        status: "failed",
        failureReason: reason || "Payment failed",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Record payment failure error:", error);
    return NextResponse.json({ error: "Failed to record payment failure!" }, { status: 500 });
  }
}
