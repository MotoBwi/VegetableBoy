import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromCookie } from "@/lib/jwt";

export async function GET(request) {
  try {
    const token = getTokenFromCookie(request);

    if (!token) {
      return NextResponse.json({ error: "Not logged in!" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Session expired!" },
        { status: 401 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found!" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      admin: { id: admin.id, username: admin.username },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 }
    );
  }
}
