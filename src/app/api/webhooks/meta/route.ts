import crypto from "crypto";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

type MetaLeadgenValue = {
  leadgen_id: string;
  ad_id?: string;
  form_id?: string;
};

type MetaChange = {
  field?: string;
  value: MetaLeadgenValue;
};

type MetaMessaging = {
  sender?: { id?: string };
  message?: { mid?: string; text?: string; is_echo?: boolean };
};

type MetaEntry = {
  changes?: MetaChange[];
  messaging?: MetaMessaging[];
};

type MetaWebhookBody = {
  entry?: MetaEntry[];
};

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
  console.log("[META WEBHOOK] Received POST, body length:", rawBody.length);
  console.log("[META WEBHOOK] Raw body preview:", rawBody.slice(0, 500));

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.META_APP_SECRET!)
      .update(rawBody)
      .digest("hex");
  const signature = request.headers.get("X-Hub-Signature-256");
  if (signature !== expected) {
    console.error("[META WEBHOOK] Signature mismatch. Expected:", expected, "Got:", signature);
    return new Response("Forbidden", { status: 403 });
  }
  console.log("[META WEBHOOK] Signature verified OK");

  const body = JSON.parse(rawBody);

  const entries = (body as MetaWebhookBody).entry ?? [];
  if (entries.length === 0) {
    console.log("[META WEBHOOK] No entry found in body");
    return new Response("OK", { status: 200 });
  }

  const failures: unknown[] = [];
  for (const entry of entries) {
    console.log("[META WEBHOOK] Entry keys:", Object.keys(entry));

    for (const change of entry.changes ?? []) {
      if (change.field !== "leadgen") continue;
      try {
        console.log("[META WEBHOOK] Processing leadgen:", JSON.stringify(change.value));
        await handleLeadgen(change.value);
        console.log("[META WEBHOOK] Leadgen processed successfully");
      } catch (err) {
        console.error("[META WEBHOOK] Leadgen processing error:", err);
        failures.push(err);
      }
    }

    for (const messaging of entry.messaging ?? []) {
      if (messaging.message?.is_echo) {
        console.log("[META WEBHOOK] Skipping echo message");
        continue;
      }
      if (!messaging.message) {
        console.log("[META WEBHOOK] Skipping non-message messaging event");
        continue;
      }
      if (!messaging.sender?.id) {
        const err = new Error("Messaging event missing sender id");
        console.error("[META WEBHOOK] Messaging processing error:", err);
        failures.push(err);
        continue;
      }
      try {
        console.log("[META WEBHOOK] Processing messaging from PSID:", messaging.sender.id, "text:", messaging.message.text?.slice(0, 100));
        await handleMessaging({
          sender: { id: messaging.sender.id },
          message: messaging.message,
        });
        console.log("[META WEBHOOK] Messaging processed successfully");
      } catch (err) {
        console.error("[META WEBHOOK] Messaging processing error:", err);
        failures.push(err);
      }
    }
  }

  if (failures.length > 0) {
    return new Response("Webhook processing failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

async function handleLeadgen(value: MetaLeadgenValue) {
  const { leadgen_id, ad_id, form_id } = value;
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN!;

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${leadgen_id}?access_token=${encodeURIComponent(pageToken)}`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch lead ${leadgen_id}: ${res.status} ${await res.text()}`);
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

export async function handleMessaging(messaging: {
  sender: { id: string };
  message?: { mid?: string; text?: string; is_echo?: boolean };
}) {
  const psid = messaging.sender.id;
  const text = messaging.message?.text ?? "";
  const mid = messaging.message?.mid ?? null;
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN!;

  if (mid) {
    const existing = await prisma.message.findFirst({
      where: {
        channel: "MESSENGER",
        direction: "INBOUND",
        externalId: mid,
      },
      select: { id: true },
    });
    if (existing) {
      console.log("[META WEBHOOK] Skipping duplicate inbound message:", mid);
      return;
    }
  }

  const contact = await prisma.contact.upsert({
    where: { fbSenderId: psid },
    update: { source: "messenger_message" },
    create: { fbSenderId: psid, source: "messenger_message" },
  });
  console.log("[META WEBHOOK] Upserted contact:", contact.id, "for PSID:", psid);

  // Fetch profile for name
  try {
    const profileRes = await fetch(
      `https://graph.facebook.com/v20.0/${psid}?fields=first_name,last_name&access_token=${encodeURIComponent(pageToken)}`,
    );
    if (profileRes.ok) {
      const profile = await profileRes.json();
      console.log("[META WEBHOOK] Profile fetched:", JSON.stringify(profile));
      if (profile.first_name || profile.last_name) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            ...(profile.first_name && { firstName: profile.first_name }),
            ...(profile.last_name && { lastName: profile.last_name }),
          },
        });
      }
    } else {
      console.warn("[META WEBHOOK] Profile fetch failed:", profileRes.status, await profileRes.text());
    }
  } catch (profileErr) {
    console.warn("[META WEBHOOK] Profile fetch error:", profileErr);
  }

  const message = await prisma.message.create({
    data: {
      contactId: contact.id,
      channel: "MESSENGER",
      direction: "INBOUND",
      body: text,
      externalId: mid,
    },
  });
  console.log("[META WEBHOOK] Created message:", message.id, "for contact:", contact.id);

  // Extract phone number from message text
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const extractedPhones = text.match(phoneRegex);
  console.log("[META WEBHOOK] Phone extraction:", extractedPhones);
  if (extractedPhones?.length && !contact.phone) {
    const cleaned = extractedPhones[0].replace(/\D/g, "");
    const normalized =
      cleaned.length === 10 ? "+1" + cleaned : "+" + cleaned;
    await prisma.contact.update({
      where: { id: contact.id },
      data: { phone: normalized },
    });
  }

  // Extract email from message text
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const extractedEmails = text.match(emailRegex);
  console.log("[META WEBHOOK] Email extraction:", extractedEmails);
  if (extractedEmails?.length && !contact.email) {
    const email = extractedEmails[0].toLowerCase();
    await prisma.contact.update({
      where: { id: contact.id },
      data: { email },
    });
    await prisma.subscriber.upsert({
      where: { email },
      create: {
        email,
        firstName: contact.firstName ?? undefined,
        source: "messenger_message",
        consentedAt: new Date(),
      },
      update: {},
    });
  }
}
