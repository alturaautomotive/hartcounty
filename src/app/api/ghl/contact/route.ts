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

  const contactId = (body.contact_id as string) ?? null;
  const firstName = (body.first_name as string) ?? (body.firstName as string) ?? null;
  const lastName = (body.last_name as string) ?? (body.lastName as string) ?? null;
  const fullName = (body.full_name as string) ?? null;

  // Email from custom data fields (added in GHL webhook config)
  let email: string | null =
    (body.email as string) ?? (body.Email as string) ?? null;

  // Fallback: fetch from GHL Contacts API if contact_id is available
  if (!email && contactId && process.env.GHL_API_KEY) {
    try {
      const res = await fetch(
        `https://services.leadconnectorhq.com/contacts/${contactId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GHL_API_KEY}`,
            Version: "2021-07-28",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        email = (data?.contact?.email as string) ?? null;
        console.log("[GHL INBOUND] Fetched email from API:", email);
      }
    } catch (err) {
      console.error("[GHL INBOUND] GHL API fetch error:", err);
    }
  }

  if (!email) {
    return NextResponse.json(
      { error: "Email is required", contact_id: contactId, first_name: firstName },
      { status: 400 }
    );
  }

  // Parse first/last from full_name if individual fields are missing
  let parsedFirst: string | null = firstName;
  let parsedLast: string | null = lastName;
  if (!parsedFirst && fullName) {
    const parts = fullName.trim().split(" ");
    parsedFirst = parts[0] ?? null;
    const rest = parts.slice(1).join(" ");
    parsedLast = rest.length > 0 ? rest : null;
  }

  try {
    await prisma.subscriber.upsert({
      where: { email },
      update: { firstName: parsedFirst ?? undefined },
      create: {
        email,
        firstName: parsedFirst ?? null,
        source: "ghl",
        consentedAt: new Date(),
      },
    });

    const existing = await prisma.contact.findFirst({ where: { email } });
    if (!existing) {
      await prisma.contact.create({
        data: {
          email,
          firstName: parsedFirst ?? null,
          lastName: parsedLast ?? null,
          source: "ghl",
        },
      });
    } else {
      await prisma.contact.update({
        where: { id: existing.id },
        data: {
          firstName: parsedFirst ?? undefined,
          lastName: parsedLast ?? undefined,
        },
      });
    }

    return NextResponse.json({ success: true, email, firstName: parsedFirst, lastName: parsedLast });
  } catch (err) {
    console.error("[GHL INBOUND] DB error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
