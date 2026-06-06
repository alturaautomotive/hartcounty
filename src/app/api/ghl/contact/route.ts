import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Inbound webhook from GoHighLevel.
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

  // Log full payload for debugging
  console.log("[GHL INBOUND] Payload:", JSON.stringify(body));

  // GHL can nest contact data under a "contact" key or send flat
  const contact = (body.contact as Record<string, unknown>) ?? body;

  const email =
    (contact.email as string) ??
    (contact.Email as string) ??
    (contact.emailAddress as string) ??
    (body.email as string) ??
    (body.Email as string) ??
    null;

  const firstName =
    (contact.firstName as string) ??
    (contact.first_name as string) ??
    (contact.name as string) ??
    (body.firstName as string) ??
    (body.first_name as string) ??
    null;

  const lastName =
    (contact.lastName as string) ??
    (contact.last_name as string) ??
    (body.lastName as string) ??
    (body.last_name as string) ??
    null;

  const phone =
    (contact.phone as string) ??
    (contact.Phone as string) ??
    (contact.phoneNumber as string) ??
    (body.phone as string) ??
    (body.Phone as string) ??
    null;

  if (!email) {
    console.log("[GHL INBOUND] Missing email. Full body:", JSON.stringify(body));
    return NextResponse.json(
      { error: "Email is required", received: Object.keys(body) },
      { status: 400 }
    );
  }

  try {
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

    return NextResponse.json({ success: true, email, firstName, lastName, phone });
  } catch (err) {
    console.error("[GHL INBOUND] DB error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
