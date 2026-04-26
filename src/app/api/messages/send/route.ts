import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { contactId, body } = await request.json();
  if (!contactId || !body) {
    return NextResponse.json({ error: "contactId and body required" }, { status: 400 });
  }

  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }
  if (!contact.fbSenderId) {
    return NextResponse.json({ error: "Contact has no Messenger ID" }, { status: 400 });
  }

  const pageToken = process.env.META_PAGE_ACCESS_TOKEN!;
  const res = await fetch(
    `https://graph.facebook.com/v20.0/me/messages?access_token=${encodeURIComponent(pageToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: contact.fbSenderId },
        message: { text: body },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Meta send error:", errText);
    return NextResponse.json({ error: "Failed to send message" }, { status: 502 });
  }

  const result = await res.json();

  const message = await prisma.message.create({
    data: {
      contactId,
      channel: "MESSENGER",
      direction: "OUTBOUND",
      body,
      externalId: result.message_id ?? null,
    },
  });

  return NextResponse.json({ success: true, messageId: message.id });
}
