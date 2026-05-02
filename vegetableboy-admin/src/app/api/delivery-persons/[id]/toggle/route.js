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

export async function PATCH(request, { params }) {
  const auth = await requireAuth(request);
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const person = await prisma.deliveryPerson.findUnique({ where: { id } });
    if (!person) {
      return NextResponse.json({ error: "Delivery person not found!" }, { status: 404 });
    }
    const newActive = !person.active;

    await prisma.$transaction(async (tx) => {
      await tx.deliveryPerson.update({
        where: { id },
        data: { active: newActive },
      });

      // Agar off duty ho raha hai, uske saare pending orders unassign kar do
      if (!newActive) {
        await tx.order.updateMany({
          where: { deliveryPersonId: id, status: "pending" },
          data: { deliveryPersonId: null },
        });
      }
    });

    const updated = await prisma.deliveryPerson.findUnique({
      where: { id },
      include: { zoneDeliveryPersons: { include: { zone: true } } },
    });
    const { password: _, ...safePerson } = updated;
    return NextResponse.json(safePerson);
  } catch (error) {
    console.error("Toggle delivery person error:", error);
    return NextResponse.json({ error: "Failed to toggle!" }, { status: 500 });
  }
}
