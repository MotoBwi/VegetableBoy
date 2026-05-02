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

    const user = await prisma.user.findUnique({
      where: { phone: phone.trim() },
      include: { zone: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid phone or password!" }, { status: 401 });
    }
    if (!user.password) {
      return NextResponse.json({ error: "Password not set. Contact admin." }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid phone or password!" }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ error: "Account is deactivated!" }, { status: 403 });
    }

    const token = await signToken({
      userId: user.id,
      phone: user.phone,
      name: user.name,
    });

    clearRateLimit(phone.trim());

    const response = NextResponse.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        image: user.image,
        zone: user.zone.name,
        block: user.block,
        building: user.building,
        flat: user.flat,
      },
    });

    response.cookies.set("userToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 4,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("User login error:", error);
    return NextResponse.json({ error: "Login failed!" }, { status: 500 });
  }
}
