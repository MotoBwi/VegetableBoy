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
    const failedPayments = await prisma.paymentAttempt.findMany({
      where: { status: "failed" },
      include: { user: true, zone: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = failedPayments.map((fp) => ({
      id: fp.id,
      user: fp.user?.name || "Unknown",
      phone: fp.user?.phone || "",
      zone: fp.zone?.name || "",
      total: fp.total,
      deliveryCharge: fp.deliveryCharge,
      razorpayOrderId: fp.razorpayOrderId,
      failureReason: fp.failureReason,
      itemsJson: fp.itemsJson,
      createdAt: fp.createdAt,
    }));

    return NextResponse.json({ failedPayments: formatted });
  } catch (error) {
    console.error("Get failed payments error:", error);
    return NextResponse.json({ error: "Failed to fetch failed payments!" }, { status: 500 });
  }
}
