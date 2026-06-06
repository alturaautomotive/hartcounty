import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

  console.log("[GHL INBOUND] Full payload:", JSON.stringify(body));

  // GHL nests contact data under a "contact" key
  const contactObj = (body.contact as Record<string, unknown>) ?? {};

  const email =
    (contactObj.email as string) ??
    (contactObj.Email as string) ??
    (contactObj.emailAddress as string) ??
    (contactObj.email_address as string) ??
    (body.email as string) ??
    null;

  const firstName =
    (contactObj.firstName as string) ??
    (contactObj.first_name as string) ??
    (body.first_name as string) ??
    null;

  const lastName =
    (contactObj.lastName as string) ??
    (contactObj.last_name as string) ??
    (body.last_name as string) ??
    null;

  const phone =
    (contactObj.phone as string) ??
    (contactObj.Phone as string) ??
    (contactObj.phoneNumber as string) ??
    (body.phone as string) ??
    null;

  if (!email) {
    // Expose nested contact keys so we can see exact field names
    return NextResponse.json(
      {
        error: "Email is required",
        top_level_keys: Object.keys(body),
        contact_keys: Object.keys(contactObj),
        contact_sample: contactObj,
      },
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
