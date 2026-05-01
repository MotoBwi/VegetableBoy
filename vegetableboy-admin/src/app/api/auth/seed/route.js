import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory rate limiter for seed endpoint — keyed by a fingerprint
const rateLimitMap = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getFingerprint(request) {
  const ua = request.headers.get("user-agent") || "";
  const ip = request.headers.get("x-real-ip") || "unknown";
  return `${ip}:${ua.slice(0, 50)}`;
}

function isRateLimited(key) {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { attempts: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  record.attempts += 1;
  if (record.attempts > MAX_ATTEMPTS) {
    return true;
  }
  rateLimitMap.set(key, record);
  return false;
}

function constantTimeCompare(a, b) {
  const maxLen = Math.max(a.length, b.length);
  const bufA = Buffer.alloc(maxLen);
  const bufB = Buffer.alloc(maxLen);
  Buffer.from(a).copy(bufA);
  Buffer.from(b).copy(bufB);
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request) {
  try {
    const fp = getFingerprint(request);
    if (isRateLimited(fp)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    const { key, username, password } = await request.json();

    if (!key || !username || !password) {
      return NextResponse.json(
        { error: "Invalid request!" },
        { status: 400 }
      );
    }

    const expectedKey = process.env.ADMIN_SEED_KEY || "";

    // Reject before constant-time compare if env var is missing
    if (expectedKey.length < 32) {
      return NextResponse.json(
        { error: "Invalid seed key!" },
        { status: 403 }
      );
    }

    const match = constantTimeCompare(key, expectedKey);

    if (!match) {
      return NextResponse.json(
        { error: "Invalid seed key!" },
        { status: 403 }
      );
    }

    if (typeof username !== "string" || username.trim().length < 3 || username.trim().length > 50) {
      return NextResponse.json(
        { error: "Username must be 3–50 characters!" },
        { status: 400 }
      );
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "Password must be 6–128 characters!" },
        { status: 400 }
      );
    }

    const existing = await prisma.admin.findUnique({ where: { username: username.trim() } });
    if (existing) {
      return NextResponse.json(
        { error: "Invalid seed key!" },
        { status: 403 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const admin = await prisma.admin.create({
      data: { username: username.trim(), password: hashed },
    });

    return NextResponse.json({
      message: "Admin created successfully!",
      admin: { id: admin.id, username: admin.username },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Admin creation failed!" },
      { status: 500 }
    );
  }
}
