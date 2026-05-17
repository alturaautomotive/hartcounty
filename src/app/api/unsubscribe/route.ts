import { NextRequest } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getAdminTokenSecret } from "@/lib/token-secret";

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

    const payload = Buffer.from(payloadB64, "base64").toString();
    const expected = crypto
      .createHmac("sha256", getAdminTokenSecret())
      .update(payload)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const sigBuffer = Buffer.from(sig);
    if (
      expectedBuffer.length !== sigBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, sigBuffer)
    ) {
      throw new Error("invalid signature");
    }

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
