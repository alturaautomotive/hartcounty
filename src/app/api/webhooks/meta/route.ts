import crypto from "crypto";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge ?? "", {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.META_APP_SECRET!)
      .update(rawBody)
      .digest("hex");
  const signature = request.headers.get("X-Hub-Signature-256");
  if (signature !== expected) {
    return new Response("Forbidden", { status: 403 });
  }

  const body = JSON.parse(rawBody);

  try {
    const entry = body.entry?.[0];
    if (!entry) return new Response("OK", { status: 200 });

    // Leadgen webhook
    const change = entry.changes?.[0];
    if (change?.field === "leadgen") {
      await handleLeadgen(change.value);
      return new Response("OK", { status: 200 });
    }

    // Messaging webhook
    const messaging = entry.messaging?.[0];
    if (messaging) {
      if (messaging.message?.is_echo) {
        return new Response("OK", { status: 200 });
      }
      await handleMessaging(messaging);
      return new Response("OK", { status: 200 });
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
  }

  return new Response("OK", { status: 200 });
}

async function handleLeadgen(value: {
  leadgen_id: string;
  ad_id?: string;
  form_id?: string;
}) {
  const { leadgen_id, ad_id, form_id } = value;
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN!;

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${leadgen_id}?access_token=${encodeURIComponent(pageToken)}`,
  );
  if (!res.ok) {
    console.error("Failed to fetch lead:", await res.text());
    return;
  }
  const lead = await res.json();
  const fields: Record<string, string> = {};
  for (const f of lead.field_data ?? []) {
    fields[f.name] = f.values?.[0] ?? "";
  }

  const email = fields.email || null;
  const phone = fields.phone_number || null;
  let firstName: string | null = null;
  let lastName: string | null = null;

  if (fields.full_name) {
    const parts = fields.full_name.split(" ");
    firstName = parts[0] ?? null;
    lastName = parts.slice(1).join(" ") || null;
  } else {
    firstName = fields.first_name || null;
    lastName = fields.last_name || null;
  }

  await prisma.contact.upsert({
    where: { fbLeadId: leadgen_id },
    update: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(phone && { phone }),
      source: "messenger_lead",
      ...(ad_id && { fbAdId: ad_id }),
      ...(form_id && { fbFormId: form_id }),
    },
    create: {
      fbLeadId: leadgen_id,
      firstName,
      lastName,
      email,
      phone,
      source: "messenger_lead",
      fbAdId: ad_id ?? null,
      fbFormId: form_id ?? null,
    },
  });

  if (email) {
    await prisma.subscriber.upsert({
      where: { email },
      create: {
        email,
        source: "messenger_lead",
        consentedAt: new Date(),
        ...(firstName && { firstName }),
      },
      update: {},
    });
  }
}

async function handleMessaging(messaging: {
  sender: { id: string };
  message?: { mid?: string; text?: string };
}) {
  const psid = messaging.sender.id;
  const text = messaging.message?.text ?? "";
  const mid = messaging.message?.mid ?? null;
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN!;

  const contact = await prisma.contact.upsert({
    where: { fbSenderId: psid },
    update: { source: "messenger_message" },
    create: { fbSenderId: psid, source: "messenger_message" },
  });

  // Fetch profile for name
  try {
    const profileRes = await fetch(
      `https://graph.facebook.com/v20.0/${psid}?fields=first_name,last_name&access_token=${encodeURIComponent(pageToken)}`,
    );
    if (profileRes.ok) {
      const profile = await profileRes.json();
      if (profile.first_name || profile.last_name) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            ...(profile.first_name && { firstName: profile.first_name }),
            ...(profile.last_name && { lastName: profile.last_name }),
          },
        });
      }
    }
  } catch {
    // Profile fetch is best-effort
  }

  await prisma.message.create({
    data: {
      contactId: contact.id,
      channel: "MESSENGER",
      direction: "INBOUND",
      body: text,
      externalId: mid,
    },
  });
}
