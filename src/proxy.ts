import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const TOKEN_SECRET = process.env.ADMIN_SECRET ?? "hart-county-admin-secret-key";
const publicAdminRoutes = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

function verifyToken(token: string): boolean {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return false;
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    if (sig !== expected) return false;
    const data = JSON.parse(payload);
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect admin routes that are not part of the sign-in/reset flow.
  if (pathname.startsWith("/admin") && !publicAdminRoutes.has(pathname)) {
    const token = request.cookies.get("admin-token")?.value;
    if (!token || !verifyToken(token)) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
