import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { zone: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        image: user.image,
        zone: user.zone?.name || "",
        block: user.block,
        building: user.building,
        flat: user.flat,
        active: user.active,
      },
    });
  } catch (error) {
    console.error("User me error:", error);
    return NextResponse.json({ error: "Failed to fetch profile!" }, { status: 500 });
  }
}

export async function PUT(request) {
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
    const { name, phone, block, building, flat, image } = body;

    const updateData = {};
    if (typeof name === "string" && name.trim().length > 0) updateData.name = name.trim();
    if (typeof phone === "string" && /^\d{10}$/.test(phone.trim())) updateData.phone = phone.trim();
    if (typeof block === "string") updateData.block = block.trim();
    if (typeof building === "string") updateData.building = building.trim();
    if (typeof flat === "string") updateData.flat = flat.trim();
    if (typeof image === "string") updateData.image = image.trim().slice(0, 500);

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      include: { zone: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        image: user.image,
        zone: user.zone?.name || "",
        block: user.block,
        building: user.building,
        flat: user.flat,
        active: user.active,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile!" }, { status: 500 });
  }
}
