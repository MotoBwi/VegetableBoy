import bcrypt from "bcryptjs";
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

export async function PUT(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, password, image, zoneIds, active } = body;

    const data = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (trimmed.length > 100) return NextResponse.json({ error: "Name must be ≤100 chars!" }, { status: 400 });
      data.name = trimmed;
    }
    if (phone !== undefined) {
      if (!/^\d{10}$/.test(phone.trim())) {
        return NextResponse.json({ error: "Valid 10-digit phone required!" }, { status: 400 });
      }
      data.phone = phone.trim();
    }
    if (password !== undefined && password.length > 0) {
      if (password.length < 4) {
        return NextResponse.json({ error: "Password must be at least 4 characters!" }, { status: 400 });
      }
      data.password = await bcrypt.hash(password, 10);
    }
    if (image !== undefined) data.image = image.trim().slice(0, 500);
    if (zoneIds !== undefined) {
      if (!Array.isArray(zoneIds) || zoneIds.length === 0 || zoneIds.some((id) => !id || typeof id !== 'string')) {
        return NextResponse.json({ error: "At least one valid zone is required!" }, { status: 400 });
      }
    }
    if (active !== undefined) data.active = active;

    let person;
    if (zoneIds !== undefined) {
      person = await prisma.$transaction(async (tx) => {
        await tx.zoneDeliveryPerson.deleteMany({ where: { deliveryPersonId: id } });
        await tx.zoneDeliveryPerson.createMany({
          data: zoneIds.map((zoneId) => ({ zoneId, deliveryPersonId: id })),
        });
        return await tx.deliveryPerson.update({
          where: { id: id },
          data,
          include: { zoneDeliveryPersons: { include: { zone: true } } },
        });
      });
    } else {
      person = await prisma.deliveryPerson.update({
        where: { id: id },
        data,
        include: { zoneDeliveryPersons: { include: { zone: true } } },
      });
    }
    const { password: _, ...safePerson } = person;
    return NextResponse.json(safePerson);
  } catch (error) {
    console.error("Update delivery person error:", error);
    return NextResponse.json({ error: "Failed to update delivery person!" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await prisma.deliveryPerson.delete({ where: { id: id } });
    return NextResponse.json({ message: "Delivery person deleted!" });
  } catch (error) {
    console.error("Delete delivery person error:", error);
    return NextResponse.json({ error: "Failed to delete delivery person!" }, { status: 500 });
  }
}
