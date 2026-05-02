import { NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";
import { checkApiRateLimit } from "./lib/apiRateLimit";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/delivery-login",
  "/api/auth/user-login",
  "/api/auth/seed",
];

// Delivery APIs and user APIs handle their own Bearer token auth
function isPublicPath(pathname) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/api/delivery")) return true;
  if (pathname.startsWith("/api/user")) return true;
  if (pathname === "/api/products") return true;
  if (pathname === "/api/auth/user-me") return true;
  return false;
}

function getClientIp(request) {
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths, static assets, and CORS preflight OPTIONS
  if (
    isPublicPath(pathname) ||
    pathname.startsWith("/_next") ||
    request.method === "OPTIONS"
  ) {
    return NextResponse.next();
  }

  // General API rate limiting for authenticated endpoints
  if (pathname.startsWith("/api")) {
    const ip = getClientIp(request);
    const limit = checkApiRateLimit(`${ip}:${pathname}:${request.method}`);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later.", retryAfter: limit.retryAfter },
        { status: 429 }
      );
    }
  }

  // Check auth token
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  const token = cookies.token || null;

  if (!token) {
    // API routes: return 401 JSON
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Page routes: redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|woff|woff2)).*)",
  ],
};
