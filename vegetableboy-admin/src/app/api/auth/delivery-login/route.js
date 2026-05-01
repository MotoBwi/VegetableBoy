import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { checkRateLimit, clearRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || typeof phone !== "string" || !/^\d{10}$/.test(phone.trim())) {
      return NextResponse.json({ error: "Valid 10-digit phone is required!" }, { status: 400 });
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required!" }, { status: 400 });
    }

    const limit = checkRateLimit(phone.trim());
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later.", retryAfter: limit.retryAfter },
        { status: 429 }
      );
    }

    const person = await prisma.deliveryPerson.findUnique({
      where: { phone: phone.trim() },
      include: { zones: true },
    });

    if (!person || !person.password) {
      return NextResponse.json({ error: "Invalid phone or password!" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, person.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid phone or password!" }, { status: 401 });
    }

    if (!person.active) {
      return NextResponse.json({ error: "Account is deactivated!" }, { status: 403 });
    }

    const token = await signToken({
      deliveryPersonId: person.id,
      phone: person.phone,
      name: person.name,
    });

    clearRateLimit(phone.trim());

    return NextResponse.json({
      message: "Login successful!",
      token,
      deliveryPerson: {
        id: person.id,
        name: person.name,
        phone: person.phone,
        image: person.image,
        zones: person.zones.map((z) => ({ id: z.id, name: z.name })),
      },
    });
  } catch (error) {
    console.error("Delivery login error:", error);
    return NextResponse.json({ error: "Login failed!" }, { status: 500 });
  }
}
