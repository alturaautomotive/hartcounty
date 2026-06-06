import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "GHL_WEBHOOK_URL not configured" }, { status: 500 });
  }

  const body = await request.json();
  const { firstName, lastName, email, phone } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const payload = {
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    email,
    phone: phone ?? "",
    tags: ["hart-county-shelter", "newsletter"],
    source: "Hart County Admin",
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[GHL WEBHOOK] Failed:", res.status, text);
    return NextResponse.json({ error: "GHL webhook failed" }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
