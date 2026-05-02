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
    const { name, area, deliveryPersonIds } = body;

    const data = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (trimmed.length > 50) return NextResponse.json({ error: "Name must be ≤50 chars!" }, { status: 400 });
      data.name = trimmed;
    }
    if (area !== undefined) {
      const trimmed = area.trim();
      if (trimmed.length > 200) return NextResponse.json({ error: "Area must be ≤200 chars!" }, { status: 400 });
      data.area = trimmed;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update zone fields
      const zone = await tx.zone.update({
        where: { id },
        data,
      });

      // If delivery persons provided, replace existing joins
      if (Array.isArray(deliveryPersonIds)) {
        await tx.zoneDeliveryPerson.deleteMany({ where: { zoneId: id } });
        if (deliveryPersonIds.length > 0) {
          await tx.zoneDeliveryPerson.createMany({
            data: deliveryPersonIds.map((dpId) => ({
              zoneId: id,
              deliveryPersonId: dpId,
            })),
          });
        }
      }

      return tx.zone.findUnique({
        where: { id },
        include: {
          _count: { select: { users: true } },
          zoneDeliveryPersons: { include: { deliveryPerson: { select: { id: true, name: true } } } },
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update zone error:", error);
    return NextResponse.json({ error: "Failed to update zone!" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await prisma.zone.delete({ where: { id: id } });
    return NextResponse.json({ message: "Zone deleted!" });
  } catch (error) {
    console.error("Delete zone error:", error);
    return NextResponse.json({ error: "Failed to delete zone!" }, { status: 500 });
  }
}
