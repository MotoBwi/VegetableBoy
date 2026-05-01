import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { checkRateLimit, clearRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username and password required!" }, { status: 400 });
    }

    const limit = checkRateLimit(username.toLowerCase().trim());
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later.", retryAfter: limit.retryAfter },
        { status: 429 }
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username aur password dono chahiye!" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid username ya password!" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username ya password!" },
        { status: 401 }
      );
    }

    const token = await signToken({ adminId: admin.id, username: admin.username });
    clearRateLimit(username.toLowerCase().trim());

    const response = NextResponse.json({
      message: "Login successful!",
      admin: { id: admin.id, username: admin.username },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 4, // 4 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed!" },
      { status: 500 }
    );
  }
}
