import { NextRequest } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

function getTokenSecret(): string | null {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "hart-county-admin-dev-secret-key";
  }

  console.error("ADMIN_SECRET is required to verify unsubscribe tokens.");
  return null;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new Response("<h1>Invalid link.</h1>", {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) throw new Error("malformed");

    const tokenSecret = getTokenSecret();
    if (!tokenSecret) throw new Error("missing token secret");

    const payload = Buffer.from(payloadB64, "base64").toString();
    const expected = crypto
      .createHmac("sha256", tokenSecret)
      .update(payload)
      .digest("hex");

    if (sig !== expected) throw new Error("invalid signature");

    const data = JSON.parse(payload);
    if (data.purpose !== "unsubscribe" || !data.id) throw new Error("invalid");

    await prisma.subscriber.update({
      where: { id: data.id },
      data: { unsubscribed: true },
    });

    return new Response(
      `<!DOCTYPE html>
<html><head><title>Unsubscribed</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#FAF7F2;">
<div style="text-align:center;max-width:400px;padding:40px;">
<h1 style="color:#1A4F8A;">Unsubscribed</h1>
<p style="color:#6B7280;">Sorry to see you go. You will no longer receive our weekly digest.</p>
</div>
</body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch {
    return new Response("<h1>Invalid or expired link.</h1>", {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }
}
