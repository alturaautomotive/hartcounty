import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Inbound webhook from GoHighLevel.
// GHL fires this when a new contact is created/updated in a workflow.
// Auth: shared secret in X-GHL-Secret header (set GHL_WEBHOOK_SECRET in Vercel).

export async function POST(request: NextRequest) {
  const secret = process.env.GHL_WEBHOOK_SECRET;
  if (secret) {
    const incoming = request.headers.get("x-ghl-secret");
    if (incoming !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    (body.email as string) ??
    (body.Email as string) ??
    null;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const firstName =
    (body.firstName as string) ??
    (body.first_name as string) ??
    null;

  const lastName =
    (body.lastName as string) ??
    (body.last_name as string) ??
    null;

  const phone =
    (body.phone as string) ??
    (body.Phone as string) ??
    null;

  try {
    // Upsert subscriber — add to newsletter list
    await prisma.subscriber.upsert({
      where: { email },
      update: { firstName: firstName ?? undefined },
      create: {
        email,
        firstName: firstName ?? null,
        source: "ghl",
        consentedAt: new Date(),
      },
    });

    // Create contact if not already present (email is optional on Contact so use findFirst)
    const existing = await prisma.contact.findFirst({ where: { email } });
    if (!existing) {
      await prisma.contact.create({
        data: {
          email,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          phone: phone ?? null,
          source: "ghl",
        },
      });
    } else {
      await prisma.contact.update({
        where: { id: existing.id },
        data: {
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
          phone: phone ?? undefined,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[GHL INBOUND] DB error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// GHL sometimes sends a GET to verify the endpoint is alive
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
