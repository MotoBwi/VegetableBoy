import { NextResponse } from "next/server";
import { verifyToken, getTokenFromCookie } from "@/lib/jwt";

export async function POST(request) {
  const token = getTokenFromCookie(request);

  if (!token) {
    return NextResponse.json({ error: "Not logged in!" }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Session expired!" }, { status: 401 });
  }

  const response = NextResponse.json({ message: "Logout successful!" });

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}
